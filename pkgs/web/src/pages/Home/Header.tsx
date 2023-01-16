import { useState } from 'react';

import { Icon } from '@iconify/react';
import {
  createStyles, Header, Container, Group, Text, useMantineTheme, Button,
} from '@mantine/core';
import { Link } from 'react-router-dom';

import { FeedbackModal } from '../Extractor/FeedbackModal';


const HEADER_HEIGHT = 60;

const useStyles = createStyles((theme) => ({
  root: {
    position: 'relative',
    zIndex: 1,
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
  },

  links: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
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
      <Header height={HEADER_HEIGHT} mih={HEADER_HEIGHT} className={classes.root}>
        <Container className={classes.header}>
          <Group spacing={5}>
            <Icon icon="eos-icons:content-lifecycle-management" css={{
              fontSize: '1.5em',
              color: theme.fn.primaryColor(),
            }}/>
            <Text size={20} fw={600}>Substance</Text>
          </Group>
          <Group spacing={5} className={classes.links}>
            <Link to='/extractor'>
              <Button size="xs" variant='outline' fw='bolder'>Open Extractor</Button>
            </Link>
            <Button size="xs" variant='subtle' color='gray' className={classes.linkButton}
              onClick={() => setFeedbackOpened(true)}
            >Feedback</Button>
            <a href="https://github.com/reorx/substance" target='_blank'>
              <Button size="xs" variant='subtle' color='gray' className={classes.linkButton}
                rightIcon={<Icon icon="tabler:external-link" />}
              >GitHub</Button>
            </a>
          </Group>
        </Container>
      </Header>
    </>
  );
}
