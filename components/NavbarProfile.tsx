import {
  Avatar,
  Box,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  VStack,
  Text,
} from '@chakra-ui/react'
import { UserSession } from '../lib/types/auth'
import { FiChevronDown, FiLogOut } from 'react-icons/fi'

interface INavbarProfileProps {
  currentUser: UserSession
  onLogOut: () => void
}

const NavbarProfile = ({ currentUser, onLogOut }: INavbarProfileProps) => {
  return (
    <Flex
      alignItems={'center'}
      gridColumnGap={{ base: '0', md: '6' }}
      justifyContent="center"
    >
      <Box w="auto">
        <Menu autoSelect={false}>
          <MenuButton
            py={2}
            transition="all 0.3s"
            _focus={{ boxShadow: 'none' }}
          >
            <Flex direction={'row'} alignItems="center">
              <Avatar
                size={'sm'}
                src={'https://robohash.org/' + currentUser?.email}
                name={currentUser.name + ' ' + currentUser.name}
                bg={'white'}
              />
              <VStack
                display={{ base: 'none', md: 'flex' }}
                alignItems="flex-start"
                spacing="1px"
                ml="2"
              >
                <Text fontSize="sm" color="white">
                  {currentUser.name} {currentUser.surname}
                </Text>
              </VStack>
              <Box display={{ base: 'none', md: 'flex' }}>
                <FiChevronDown color="white" />
              </Box>
            </Flex>
          </MenuButton>
          <MenuList>
            <MenuItem onClick={onLogOut} icon={<FiLogOut />}>
              Sign out
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </Flex>
  )
}

export default NavbarProfile
