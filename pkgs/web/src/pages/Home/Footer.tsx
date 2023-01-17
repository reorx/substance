import { createStyles, Container, Text, Box } from '@mantine/core';


const useStyles = createStyles((theme) => ({
  footer: {
    borderTop: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
  },

  inner: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,

    [theme.fn.smallerThan('xs')]: {
      flexDirection: 'column',
    },
  },

  links: {
    [theme.fn.smallerThan('xs')]: {
      marginTop: theme.spacing.md,
    },
  },
}));

export function HomeFooter() {
  const { classes } = useStyles();

  return (
    <Box mt={50} className={classes.footer}>
      <Container className={classes.inner}>
        <Text>Made by Reorx.</Text>
      </Container>
    </Box>
  );
}
