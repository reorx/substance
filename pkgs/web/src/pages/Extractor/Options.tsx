import { Icon } from '@iconify/react';
import { Box, Tooltip, Chip, Flex, ActionIcon } from '@mantine/core';
import { Options } from '@substance/common/extract';
import { WikipediaExtractor } from '@substance/common/extractors/wikipedia';

import { gutter } from './styles';


interface OptionsProps {
  options: Options
}

export function ExtractorOptions({options}: OptionsProps) {
  return (
    <Flex mt={8} align='center'>
      <ActionIcon variant='transparent' mr={gutter} color='dark'>
        <Icon icon="material-symbols:settings-rounded" />
      </ActionIcon>
      {Object.keys(WikipediaExtractor.options).map((key) => (
        <Tooltip
          withArrow
          multiline
          width={300}
          position="bottom"
          key={key}
          label={WikipediaExtractor.options[key].help}
        >
          <Box mr={24}>
            <Chip size='xs' variant='filled'
              onChange={(checked) => {
                // update options (not a state)
                options[key] = checked
              }}
            >{key}</Chip>
          </Box>
        </Tooltip>
      ))}
    </Flex>
  )
}
