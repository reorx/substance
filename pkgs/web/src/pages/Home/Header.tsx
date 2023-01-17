import { useState } from 'react';

import { Icon } from '@iconify/react';
import {
  createStyles, Header, Group, Text, useMantineTheme, Button, Container,
} from '@mantine/core';
import { Link } from 'react-router-dom';

import { FeedbackModal } from '../Extractor/FeedbackModal';


const useStyles = createStyles((theme) => ({
  root: {
    position: 'relative',
    zIndex: 1,
    [theme.fn.smallerThan('md')]: {
      minHeight: 90,
    },
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
    flexWrap: 'wrap',
    padding: 8,
  },

  links: {
    [theme.fn.smallerThan('md')]: {
      width: '100%',
      flexGrow: 1,
      display: 'flex',
      justifyContent: 'center',
      marginTop: 8,
      marginLeft: 0,
    },
  },

  linkButton: {
    color: '#555',
  }
}));

export function HomeHeader() {
  const { classes } = useStyles();
  const theme = useMantineTheme()
  const [feedbackOpened, setFeedbackOpened] = useState(false)

  return (
    <>
      <FeedbackModal opened={feedbackOpened} onClose={() => setFeedbackOpened(false)} />
      <Header height={60} mih={60} className={classes.root}>
        <Container className={classes.header}>
          <Group spacing={5}>
            <Icon icon="eos-icons:content-lifecycle-management" css={{
              fontSize: '1.5em',
              color: theme.fn.primaryColor(),
            }}/>
            <Text size={20} fw={600}>Substance</Text>
          </Group>
          <Link to='/extractor' css={{
            marginLeft: 'auto',
          }}>
            <Button size="xs" variant='outline' fw='bolder'>Open Extractor</Button>
          </Link>
          <Group ml={5} spacing={5} className={classes.links}>
            <Button size="xs" variant='subtle' color='gray' className={classes.linkButton}
              onClick={() => setFeedbackOpened(true)}
            >Feedback</Button>
            <a href="https://github.com/reorx/substance" target='_blank'>
              <Button size="xs" variant='subtle' color='gray' className={classes.linkButton}
                rightIcon={<Icon icon="tabler:external-link" />}
              >GitHub</Button>
            </a>
            <a href="https://discord.gg/GKFu7DVZ" target='_blank'>
              <Button size="xs" variant='subtle' color='gray' className={classes.linkButton}
                rightIcon={<Icon icon="tabler:external-link" />}
              >Discord</Button>
            </a>
          </Group>
        </Container>
      </Header>
    </>
  );
}
