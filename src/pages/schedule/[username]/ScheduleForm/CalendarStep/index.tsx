import { useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';

import { Calendar } from '../../../../../components/Calendar';
import { api } from '../../../../../lib/axios';
import {
  Container,
  TimePicker,
  TimePickerHeader,
  TimePickerList,
  TimePickerItem
} from './styles';

interface Availability {
  possibleTimes: number[];
  availableTimes: number[];
}

export function CalendarStep() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const router = useRouter();

  const isDateSelected = !!selectedDate;
  const username = router.query.username;

  const weekDay = selectedDate && dayjs(selectedDate).format('dddd');
  const describedDate =
    selectedDate && dayjs(selectedDate).format('DD[ de ]MMMM');

  const selectedDateWithoutTime =
    selectedDate && dayjs(selectedDate).format('YYYY-MM-DD');

  const { data: availability } = useQuery<Availability>(
    ['availability', selectedDateWithoutTime],
    async () => {
      const response = await api.get(`/users/${username}/availability`, {
        params: {
          date: dayjs(selectedDate).format('YYYY-MM-DD')
        }
      });

      return response.data;
    },
    {
      enabled: !!selectedDate
    }
  );

  return (
    <Container isTimePickerOpen={isDateSelected}>
      <Calendar selectedDate={selectedDate} onDateSelected={setSelectedDate} />

      {isDateSelected && (
        <TimePicker>
          <TimePickerHeader>
            {weekDay} <span>{describedDate}</span>
          </TimePickerHeader>

          <TimePickerList>
            {availability?.possibleTimes.map((time) => {
              const isDisabled = !availability.availableTimes.includes(time);

              return (
                <TimePickerItem key={time} disabled={isDisabled}>
                  {String(time).padStart(2, '0')}:00h
                </TimePickerItem>
              );
            })}
          </TimePickerList>
        </TimePicker>
      )}
    </Container>
  );
}
