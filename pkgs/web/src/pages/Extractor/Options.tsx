import { Switch, Tooltip, Text } from '@mantine/core';
import { Options } from '@substance/common/extract';
import { WikipediaExtractor } from '@substance/common/extractors/wikipedia';

import { useStyles } from './styles';


interface OptionsProps {
  options: Options
}

export function ExtractorOptions({options}: OptionsProps) {
  const {classes} = useStyles()
  return (
    <>
      <Text fz="sm" lh="1.3" mr={16} fw={700}>Options:</Text>
      {Object.keys(WikipediaExtractor.options).map((key) => (
        <Switch mr={32} name={key} key={key}
          onChange={(event) => {
            // update options (not a state)
            options[key] = event.currentTarget.checked
          }}
          label={
            <Tooltip
              withArrow
              multiline
              width={300}
              position="bottom"
              label={WikipediaExtractor.options[key].help}>
              <span className={classes.innerLabel}>{key}</span>
            </Tooltip>
          }
        />
      ))}
    </>
  )
}
