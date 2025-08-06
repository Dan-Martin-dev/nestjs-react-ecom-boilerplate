import { Link } from '@tanstack/react-router'
import { Button, Text, Title, Container, Grid, Card, Box, Stack, Group } from '@mantine/core'
import { ArrowRight, ShoppingBag, Star, Users } from 'lucide-react'

export function HomePage() {
  return (
    <Box>
      {/* Hero Section */}
      <Box py={80} bg="gray.0">
        <Container size="lg">
          <Stack align="center" gap="xl">
            <Title order={1} size="3.5rem" fw={700} ta="center">
              Welcome to{' '}
              <Text component="span" c="blue">EcomStore</Text>
            </Title>
            <Text size="lg" ta="center" maw={600} c="dimmed">
              Discover amazing products at unbeatable prices. Your one-stop shop for everything you need.
            </Text>
            <Group>
              <Link to="/products">
                <Button size="lg" rightSection={<ArrowRight size={18} />}>
                  Shop Now
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={80} bg="gray.1">
        <Container size="lg">
          <Stack align="center" gap={64}>
            <Stack align="center" gap="md">
              <Title order={2} size="2.5rem" fw={700} ta="center">
                Why Choose EcomStore?
              </Title>
              <Text size="lg" ta="center" c="dimmed">
                We provide the best shopping experience with these amazing features
              </Text>
            </Stack>
            
            <Grid>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Card padding="xl">
                  <Stack align="center" gap="md">
                    <Box w={48} h={48} bg="blue" c="white" style={{ borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShoppingBag size={24} />
                    </Box>
                    <Title order={3} size="1.25rem" fw={600}>Wide Selection</Title>
                    <Text ta="center" c="dimmed">
                      Thousands of products across multiple categories to choose from
                    </Text>
                  </Stack>
                </Card>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Card padding="xl">
                  <Stack align="center" gap="md">
                    <Box w={48} h={48} bg="blue" c="white" style={{ borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Star size={24} />
                    </Box>
                    <Title order={3} size="1.25rem" fw={600}>Quality Products</Title>
                    <Text ta="center" c="dimmed">
                      Only the highest quality products from trusted suppliers
                    </Text>
                  </Stack>
                </Card>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Card padding="xl">
                  <Stack align="center" gap="md">
                    <Box w={48} h={48} bg="blue" c="white" style={{ borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={24} />
                    </Box>
                    <Title order={3} size="1.25rem" fw={600}>Great Support</Title>
                    <Text ta="center" c="dimmed">
                      24/7 customer support to help you with any questions
                    </Text>
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>
          </Stack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={80}>
        <Container size="lg">
          <Stack align="center" gap="xl">
            <Title order={2} size="2.5rem" fw={700} ta="center">
              Ready to Start Shopping?
            </Title>
            <Text size="lg" ta="center" c="dimmed" maw={600}>
              Join thousands of satisfied customers and discover your new favorite products today.
            </Text>
            <Link to="/products">
              <Button size="lg" rightSection={<ArrowRight size={18} />}>
                Browse Products
              </Button>
            </Link>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}
