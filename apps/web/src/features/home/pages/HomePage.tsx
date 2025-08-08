import { Container, Title, Text, Button, Box, Stack, Group } from '@mantine/core'

export function HomePage() {
  return (
    <Box>
      <Container size="lg" py="xl">
        <Stack align="center" gap="xl">
          <Title order={1} size="3rem" ta="center">
            Welcome to <Text component="span" c="blue">EcomStore</Text>
          </Title>
          <Text size="lg" ta="center" maw={600} c="dimmed">
            Discover amazing products at unbeatable prices. Your one-stop shop for everything you need.
          </Text>
          <Group>
            <Button size="lg">
              Shop Now
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </Group>
        </Stack>
      </Container>
    </Box>
  )
}
