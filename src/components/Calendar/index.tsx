import { useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { CaretLeft, CaretRight } from 'phosphor-react';

import { api } from '../../lib/axios';
import { getWeekDays } from '../../utils/getWeekDays';
import {
  CalendarActions,
  CalendarBody,
  CalendarContainer,
  CalendarDay,
  CalendarHeader,
  CalendarTitle
} from './styles';

interface CalendarWeek {
  week: number;
  days: Array<{
    date: dayjs.Dayjs;
    disabled: boolean;
  }>;
}

type CalendarWeeks = CalendarWeek[];

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelected: (date: Date) => void;
}

interface BlockedDatesProps {
  blockedWeekDays: number[];
  blockedDates: number[];
}

export function Calendar({ onDateSelected }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    return dayjs().set('date', 1);
  });

  function handlePreviousMonth() {
    const previousMonthDate = currentDate.subtract(1, 'month');

    setCurrentDate(previousMonthDate);
  }

  function handleNextMonth() {
    const previousMonthDate = currentDate.add(1, 'month');

    setCurrentDate(previousMonthDate);
  }

  const router = useRouter();

  const shortWeekDays = getWeekDays({ short: true });

  const currentMonth = currentDate.format('MMMM');
  const currentYear = currentDate.format('YYYY');

  const username = router.query.username;

  const { data: blockedDates } = useQuery<BlockedDatesProps>(
    ['blocked-dates', currentDate.get('year'), currentDate.get('month')],
    async () => {
      const response = await api.get(`/users/${username}/blocked-dates`, {
        params: {
          year: currentDate.get('year'),
          month: String(currentDate.get('month') + 1).padStart(2, '0')
        }
      });

      return response.data;
    }
  );

  const calendarWeeks = useMemo(() => {
    const daysInMonthArray = Array.from({
      length: currentDate.daysInMonth() // criando array com a quantidade de dias no mês
    }).map((_, i) => {
      return currentDate.set('date', i + 1); // retornando a data de cada dia do mês, começando pelo dia 1
    });

    const firstWeekDay = currentDate.get('day'); // dia da semana do primeiro dia do mês, um número de 0 a 6

    const previousMonthFillArray = Array.from({
      length: firstWeekDay // criando array com a quantidade de dias no mês, pois esses são os dias do mês anterior
    })
      .map((_, i) => {
        return currentDate.subtract(i + 1, 'day'); // retornando a data de cada dia do mês anterior, começando pelo dia 1 e retrocedendo
      })
      .reverse(); // invertendo a ordem dos dias do mês anterior

    const lastDayInCurrentMonth = currentDate.set(
      'date',
      currentDate.daysInMonth()
    ); // buscando o último dia do mês

    const lastWeekDay = lastDayInCurrentMonth.get('day'); // buscando o número do dia da semana do último dia do mês

    const nextMonthFillArray = Array.from({
      length: 7 - (lastWeekDay + 1) // 7 dias da semana menos o número do dia da semana do último dia do mês (0 a 6) = quantidade de dias do mês seguinte
    }).map((_, i) => {
      return lastDayInCurrentMonth.add(i + 1, 'day'); // retornando a data de cada dia do mês seguinte, começando pelo último dia do mês
    });

    const calendarDays = [
      ...previousMonthFillArray.map((date) => ({ date, disabled: true })),
      ...daysInMonthArray.map((date) => ({
        date,
        disabled:
          !blockedDates ||
          dayjs(date).isBefore(dayjs(), 'date') ||
          blockedDates.blockedWeekDays.includes(date.get('day')) ||
          blockedDates.blockedDates.includes(date.get('date'))
      })),
      ...nextMonthFillArray.map((date) => ({ date, disabled: true }))
    ];

    const calendarWeeks = calendarDays.reduce<CalendarWeeks>(
      (weeks, _, i, original) => {
        const isNewWeek = i % 7 === 0; // se o resto da divisão por 7 for 0, é uma nova semana

        if (isNewWeek) {
          weeks.push({
            week: i / 7 + 1, // número da semana (1 a 5)
            days: original.slice(i, i + 7) // cortando o array original em grupos de 7 dias, partindo do índice atual (0, 7, 14, etc) até o índice atual + 7 (7, 14, 21, etc)
          });
        }

        return weeks;
      },
      []
    );

    return calendarWeeks;
  }, [currentDate, blockedDates]);

  return (
    <CalendarContainer>
      <CalendarHeader>
        <CalendarTitle>
          {currentMonth} <span>{currentYear}</span>
        </CalendarTitle>

        <CalendarActions>
          <button onClick={handlePreviousMonth} title="Previous month">
            <CaretLeft />
          </button>

          <button onClick={handleNextMonth} title="Previous month">
            <CaretRight />
          </button>
        </CalendarActions>
      </CalendarHeader>

      <CalendarBody>
        <thead>
          <tr>
            {shortWeekDays.map((weekDay) => (
              <th key={weekDay}>{weekDay}.</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendarWeeks.map(({ week, days }) => (
            <tr key={week}>
              {days.map(({ date, disabled }) => (
                <td key={date.toString()}>
                  <CalendarDay
                    onClick={() => onDateSelected(date.toDate())}
                    disabled={disabled}
                  >
                    {date.get('date')}
                  </CalendarDay>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </CalendarBody>
    </CalendarContainer>
  );
}
