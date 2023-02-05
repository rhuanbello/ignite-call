import { Controller, useFieldArray, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Checkbox,
  Heading,
  MultiStep,
  Text,
  TextInput
} from '@ignite-ui/react';
import { ArrowRight } from 'phosphor-react';
import { z } from 'zod';

import { convertTimeStringToMinutes } from '../../../utils/convertTimeStringToMinutes';
import { getWeekDays } from '../../../utils/getWeekDays';
import { Container, Header } from '../styles';
import {
  IntervalBox,
  IntervalsContainer,
  IntervalItem,
  IntervalDay,
  IntervalInputs,
  FormError
} from './styles';

const timeIntervalsFormSection = z.object({
  intervals: z
    .array(
      z.object({
        weekDay: z.number().min(0).max(6),
        enabled: z.boolean(),
        startTime: z.string(),
        endTime: z.string()
      })
    )
    .length(7)
    .transform((intervals) => intervals.filter((interval) => interval.enabled))
    .refine((intervals) => intervals.length > 0, {
      message: 'Você precisa selecionar pelo menos um dia da semana'
    })
    .transform((intervals) => {
      return intervals.map((interval) => ({
        weekDay: interval.weekDay,
        startTimeInMinutes: convertTimeStringToMinutes(interval.startTime),
        endTimeInMinutes: convertTimeStringToMinutes(interval.endTime)
      }));
    })
    .refine(
      (intervals) => {
        return intervals.every(
          ({ startTimeInMinutes, endTimeInMinutes }) =>
            endTimeInMinutes - 60 >= startTimeInMinutes
        );
      },
      {
        message:
          'O horário de término deve ser pelo menos 1h distante do início.'
      }
    )
});

type TimeIntervalsFormInput = z.input<typeof timeIntervalsFormSection>;
type TimeIntervalsFormOutput = z.output<typeof timeIntervalsFormSection>;

export default function TimeIntervals() {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting, errors }
  } = useForm<TimeIntervalsFormInput>({
    resolver: zodResolver(timeIntervalsFormSection),
    defaultValues: {
      intervals: [
        {
          weekDay: 0,
          enabled: false,
          startTime: '08:00',
          endTime: '18:00'
        },
        {
          weekDay: 1,
          enabled: true,
          startTime: '08:00',
          endTime: '18:00'
        },
        {
          weekDay: 2,
          enabled: true,
          startTime: '08:00',
          endTime: '18:00'
        },
        {
          weekDay: 3,
          enabled: true,
          startTime: '08:00',
          endTime: '18:00'
        },
        {
          weekDay: 4,
          enabled: true,
          startTime: '08:00',
          endTime: '18:00'
        },
        {
          weekDay: 5,
          enabled: true,
          startTime: '08:00',
          endTime: '18:00'
        },
        {
          weekDay: 6,
          enabled: false,
          startTime: '08:00',
          endTime: '18:00'
        }
      ]
    }
  });

  const weekDays = getWeekDays();

  const intervals = watch('intervals');

  const { fields } = useFieldArray({
    name: 'intervals',
    control: control
  });

  async function handleSetTimeIntervals(data: any) {
    const formData = data as TimeIntervalsFormOutput;
  }

  return (
    <Container>
      <Header>
        <Heading as="strong">Quase lá!</Heading>
        <Text>
          Defina o intervalo de horários que você está disponível em cada dia da
          semana.
        </Text>

        <MultiStep size={4} currentStep={3} />
      </Header>

      <IntervalBox as="form" onSubmit={handleSubmit(handleSetTimeIntervals)}>
        <IntervalsContainer>
          {fields.map(({ id, weekDay }, index) => (
            <IntervalItem key={id}>
              <IntervalDay>
                <Controller
                  name={`intervals.${index}.enabled`}
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <Checkbox
                        onCheckedChange={(checked) => {
                          onChange(checked === true);
                        }}
                        checked={value}
                      />
                    );
                  }}
                />

                <Text>{weekDays[weekDay]}</Text>
              </IntervalDay>

              <IntervalInputs>
                <TextInput
                  size="sm"
                  type="time"
                  step={60}
                  disabled={intervals[index].enabled === false}
                  {...register(`intervals.${index}.startTime`)}
                />

                <TextInput
                  size="sm"
                  type="time"
                  step={60}
                  disabled={intervals[index].enabled === false}
                  {...register(`intervals.${index}.endTime`)}
                />
              </IntervalInputs>
            </IntervalItem>
          ))}
        </IntervalsContainer>

        {errors.intervals && (
          <FormError size="sm">{errors.intervals.message}</FormError>
        )}

        <Button type="submit" disabled={isSubmitting}>
          Próximo passo <ArrowRight />
        </Button>
      </IntervalBox>
    </Container>
  );
}
