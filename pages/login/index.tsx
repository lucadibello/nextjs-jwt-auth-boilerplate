import {
  VStack,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  LinkBox,
  Button,
  FormControl,
  Text,
  Box,
} from "@chakra-ui/react";
import Link from "next/link";

import { useForm } from "react-hook-form";

interface LoginData {
  email: string;
  password: string;
}

const LoginPage = () => {
  // React hook form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>();

  const onSubmit = (data: LoginData) => {
    console.log(data);
  };

  return (
    <VStack spacing={4} align="stretch" maxW="sm" mx="auto" mt={8}>
      <Heading as="h1" size="2xl">
        Log In
      </Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl isInvalid={!!errors.email}>
          <Input
            placeholder="Email"
            {...register("email", {
              required: true,
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "invalid email address",
              },
            })}
          />
        </FormControl>

        {/* Show error  */}
        {errors.email && (
          <Text fontSize="sm" color="red.500">
            {errors.email.message}
          </Text>
        )}

        <FormControl mt={4} isInvalid={!!errors.password}>
          <InputGroup>
            <Input
              placeholder="Password"
              {...register("password", {
                required: true,
              })}
            />
            <InputRightElement>
              <IconButton aria-label="Show password" />
            </InputRightElement>
          </InputGroup>
        </FormControl>
        <Button type="submit" mt={4} isLoading={isSubmitting}>
          Log In
        </Button>
      </form>
      <LinkBox>
        <Link href="/signup">Don&apos;t have an account? Sign up</Link>
      </LinkBox>
    </VStack>
  );
};

export default LoginPage;
