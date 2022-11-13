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
  useToast,
} from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { useForm } from 'react-hook-form'
import { LoginApiResponse } from '../api/login'

interface LoginData {
  email: string
  password: string
}

const LoginPage = () => {
  // React hook form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>()

  const toast = useToast()
  const router = useRouter()

  const onSubmit = (data: LoginData) => {
    // Send data to API
    fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(res => res.json() as Promise<LoginApiResponse>)
      .then(res => {
        if (res.success && res.data) {
          // save tokens inside cookie
          document.cookie = `token=${res.data.token}`
          document.cookie = `refreshToken=${res.data.refreshToken}`

          // Show success toast
          toast({
            title: 'Success',
            description: 'You have successfully logged in.',
            status: 'success',
            duration: 5000,
            isClosable: true,
          })

          // Redirect to dashboard using router
          router.push('/')
        } else {
          // Show error
          toast({
            title: 'Error',
            description: res.message,
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
      })
      .catch(err => {
        // Show error toast
        toast({
          title: 'Invalid credentials',
          description: err.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
  }

  return (
    <VStack spacing={4} align="stretch" maxW="sm" mx="auto" mt={8}>
      <Heading as="h1" size="2xl">
        Log In
      </Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl isInvalid={!!errors.email}>
          <Input
            placeholder="Email"
            {...register('email', {
              required: true,
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'invalid email address',
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
              {...register('password', {
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
  )
}

export default LoginPage
