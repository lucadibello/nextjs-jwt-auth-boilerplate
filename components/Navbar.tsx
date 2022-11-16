import { Box, Flex, Heading, HStack } from '@chakra-ui/react'
import Link from 'next/link'

interface INavbarProps {
  leftComponent?: React.ReactNode[] | React.ReactNode
  rightComponent?: React.ReactNode[] | React.ReactNode
  homeURL: string
}

const Navbar = ({ leftComponent, rightComponent, homeURL }: INavbarProps) => {
  return (
    <Box
      zIndex={10}
      position={'fixed'}
      top="0"
      left={'0'}
      right="0"
      height={'60px'}
      bg="blue.600"
      width={'full'}
    >
      <Flex height={'100%'} direction={'row'} alignItems="center">
        {/* LEFT PART */}
        <HStack
          spacing={{ base: '0', md: '6' }}
          marginLeft="2vh"
          flexBasis="250px"
        >
          {/* APP LOGO */}
          <Link href={homeURL}>
            <Heading
              as="h1"
              fontSize={'25'}
              color="white"
              fontFamily={['Roboto', 'sans-serif']}
              wordBreak="keep-all"
              whiteSpace={'nowrap'}
            >
              JWT Authentication
            </Heading>
          </Link>

          {/* LEFT COMPONENT */}
          {leftComponent}
        </HStack>

        {/* RIGHT PART */}
        <Flex w="full" justifyContent={'flex-end'}>
          <HStack spacing={{ base: '0', md: '6' }} marginRight="2vh">
            {/* LEFT COMPONENT */}
            {rightComponent}
          </HStack>
        </Flex>
      </Flex>
    </Box>
  )
}

export default Navbar
