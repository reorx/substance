import { Icon } from '@iconify/react';
import { Box, Tooltip, Chip, Flex } from '@mantine/core';
import { Options } from '@substance/common/extract';
import { WikipediaExtractor } from '@substance/common/extractors/wikipedia';

import { gutter, useStyles } from './styles';


interface OptionsProps {
  options: Options
}

export function ExtractorOptions({options}: OptionsProps) {
  const {classes} = useStyles()
  return (
    <Flex mt={8} align='center'>
      <Icon icon="material-symbols:settings-rounded" color="#333" css={{
        marginLeft: gutter,
        marginRight: gutter,
      }}/>
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
