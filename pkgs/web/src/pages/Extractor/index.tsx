import { Box, Global, Flex, Stack, createStyles, useMantineTheme, TextInput, Button, Switch, Tooltip, Text } from '@mantine/core';
import { Icon } from '@iconify/react';
import { WikipediaExtractor } from '@substance/common/extractors/wikipedia'

const useStyles = createStyles((theme) => ({
  flexItemGrow: {
    flexGrow: 1,
  },
  innerLabel: {
    cursor: 'pointer',
  }
}))

export function ExtractorPage() {
  const theme = useMantineTheme();
  const { classes } = useStyles();

  return (
    <Stack spacing={0} sx={{
      height: '100%',
    }}>
      <Global
        styles={(theme) => ({
          'html, body, #root': {
            height: '100%',
          }
        })}
      />
      <Box p={8}>
        <Flex className={classes.flexItemGrow}>
          <TextInput
            icon={<Icon icon="tabler:link" />}
            radius="sm"
            size="xs"
            w={600}
            maw="50%"
            placeholder="URL"
            mr={12}
          />
          <Button color="yellow" size="xs">
            Extract
          </Button>
        </Flex>
        <Flex mt={8}>
          <Text fz="sm" lh="1.3" mr={16} fw={700}>Options:</Text>
          {Object.keys(WikipediaExtractor.options).map((key) => (
            <Switch mr={32} label={
              <Tooltip
                withArrow
                multiline
                width={300}
                position="bottom"
                label={WikipediaExtractor.options[key].help}>
                <span className={classes.innerLabel}>{key}</span>
              </Tooltip>
            } />
          ))}
        </Flex>
      </Box>
      <Flex className={classes.flexItemGrow}>
        <Box className={classes.flexItemGrow}>2</Box>
        <Box className={classes.flexItemGrow}>3</Box>
      </Flex>
    </Stack>
  )
}
