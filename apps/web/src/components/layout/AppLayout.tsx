import { AppShell, Container, Group, Burger, Text, Button, Menu, Avatar, Badge, Stack } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { ShoppingCart, User, LogOut, Heart, Settings } from 'lucide-react'
import { useAuthStore, useCartStore, useUIStore } from '../../stores'
import { useLogout } from '../../hooks/useAuth'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileNavOpened, { toggle: toggleMobileNav }] = useDisclosure()
  
  // Store states
  const { user, isAuthenticated } = useAuthStore()
  const cartItemCount = useCartStore((state) => state.getItemCount())
  const { openCartDrawer, openLoginModal } = useUIStore()
  
  // Mutations
  const logoutMutation = useLogout()

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  const handleCartClick = () => {
    if (isAuthenticated) {
      openCartDrawer()
    } else {
      openLoginModal()
    }
  }

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { desktop: true, mobile: !mobileNavOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Container size="xl" h="100%">
          <Group h="100%" justify="space-between">
            {/* Left side - Logo and Mobile burger */}
            <Group>
              <Burger
                opened={mobileNavOpened}
                onClick={toggleMobileNav}
                hiddenFrom="sm"
                size="sm"
              />
              
              <Text
                component={Link}
                to="/"
                size="xl"
                fw={700}
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                style={{ textDecoration: 'none' }}
              >
                {import.meta.env.VITE_APP_NAME || 'EcomStore'}
              </Text>
            </Group>

            {/* Center - Navigation (Desktop) */}
            <Group gap="lg" visibleFrom="sm">
              <Text component={Link} to="/products" style={{ textDecoration: 'none' }}>
                Products
              </Text>
              <Text component={Link} to="/categories" style={{ textDecoration: 'none' }}>
                Categories
              </Text>
              <Text component={Link} to="/deals" style={{ textDecoration: 'none' }}>
                Deals
              </Text>
            </Group>

            {/* Right side - Cart, User menu */}
            <Group>
              {/* Cart Button */}
              <Button
                variant="subtle"
                leftSection={<ShoppingCart size={20} />}
                onClick={handleCartClick}
                style={{ position: 'relative' }}
              >
                Cart
                {cartItemCount > 0 && (
                  <Badge
                    color="red"
                    size="xs"
                    circle
                    style={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      minWidth: 18,
                      height: 18,
                    }}
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              {isAuthenticated ? (
                <Menu shadow="md" width={200}>
                  <Menu.Target>
                    <Button variant="subtle" leftSection={<Avatar size="sm" />}>
                      {user?.name || 'Account'}
                    </Button>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Label>Account</Menu.Label>
                    <Menu.Item
                      leftSection={<User size={14} />}
                      component={Link}
                      to="/account/profile"
                    >
                      Profile
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<Heart size={14} />}
                      component={Link}
                      to="/account/wishlist"
                    >
                      Wishlist
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<Settings size={14} />}
                      component={Link}
                      to="/account/orders"
                    >
                      Orders
                    </Menu.Item>

                    <Menu.Divider />

                    <Menu.Item
                      leftSection={<LogOut size={14} />}
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                    >
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              ) : (
                <Group gap="sm">
                  <Button variant="subtle" onClick={openLoginModal}>
                    Login
                  </Button>
                  <Button onClick={() => useUIStore.getState().openRegisterModal()}>
                    Sign Up
                  </Button>
                </Group>
              )}
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      {/* Mobile Navigation */}
      <AppShell.Navbar py="md" px="md">
        <Stack gap="sm">
          <Text component={Link} to="/products" onClick={toggleMobileNav}>
            Products
          </Text>
          <Text component={Link} to="/categories" onClick={toggleMobileNav}>
            Categories
          </Text>
          <Text component={Link} to="/deals" onClick={toggleMobileNav}>
            Deals
          </Text>
          
          {isAuthenticated && (
            <>
              <Text component={Link} to="/account/profile" onClick={toggleMobileNav}>
                Profile
              </Text>
              <Text component={Link} to="/account/orders" onClick={toggleMobileNav}>
                Orders
              </Text>
              <Text component={Link} to="/account/wishlist" onClick={toggleMobileNav}>
                Wishlist
              </Text>
            </>
          )}
        </Stack>
      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main>
        <Container size="xl">
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}

export default AppLayout
