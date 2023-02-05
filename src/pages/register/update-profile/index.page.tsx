import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Heading, MultiStep, TextArea, Text } from '@ignite-ui/react';
import { GetServerSideProps } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { useSession } from 'next-auth/react';
import { ArrowRight } from 'phosphor-react';
import { z } from 'zod';

import { buildNextAuthOptions } from '../../api/auth/[...nextauth].api';
import { Container, Header } from '../styles';
import { FormAnnotation, ProfileBox } from './styles';

const UpdateFormSchema = z.object({
  bio: z.string()
});

type UpdateProfileData = z.infer<typeof UpdateFormSchema>;

export default function UpdateProfile() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm<UpdateProfileData>({
    resolver: zodResolver(UpdateFormSchema)
  });

  const session = useSession();

  console.log(session);

  async function handleUpdateProfile(data: UpdateProfileData) {
    //
  }

  return (
    <Container>
      <Header>
        <Heading as="strong">Bem-vindo ao Ignite Call!</Heading>
        <Text>
          Precisamos de algumas informações para criar seu perfil! Ah, você pode
          editar essas informações depois.
        </Text>

        <MultiStep size={4} currentStep={1} />
      </Header>

      <ProfileBox as="form" onSubmit={handleSubmit(handleUpdateProfile)}>
        <label>
          <Text size="sm">Foto de perfil</Text>
        </label>

        <label>
          <Text size="sm">Sobre você</Text>
          <TextArea {...register('bio')} />
          <FormAnnotation size="sm">
            Fale um pouco sobre você. Isto será exibido em sua página pessoal.
          </FormAnnotation>
        </label>

        <Button type="submit" disabled={isSubmitting}>
          FInalizar
          <ArrowRight />
        </Button>
      </ProfileBox>
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await unstable_getServerSession(
    req,
    res,
    buildNextAuthOptions(req, res)
  );

  return {
    props: {
      session
    }
  };
};
