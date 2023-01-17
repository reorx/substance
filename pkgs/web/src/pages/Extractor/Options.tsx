import { useState } from 'react';

import { Icon } from '@iconify/react';
import { Box, Tooltip, Chip, Flex, ActionIcon } from '@mantine/core';
import { Options } from '@substance/common/extract';
import { WikipediaExtractor } from '@substance/common/extractors/wikipedia';

import { gutter } from './styles';


interface OptionsProps {
  initialOptions: Options
  updateOption: (key: string, value: any) => void
}

export function ExtractorOptions({initialOptions, updateOption}: OptionsProps) {
  const [options, setOptions] = useState({...initialOptions})

  return (
    <Flex mt={8} align='center'>
      <ActionIcon variant='transparent' mr={gutter} color='dark'>
        <Icon icon="tabler:settings" />
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
          <Box mr={16}>
            <Chip size='xs' variant='filled'
              checked={options[key]}
              onChange={(checked) => {
                // update state for render
                setOptions(options => ({
                  ...options,
                  ...{
                    [key]: checked,
                  }
                }))

                // call this function to update persistant data
                updateOption(key, checked)
              }}
            >{key}</Chip>
          </Box>
        </Tooltip>
      ))}
    </Flex>
  )
}
