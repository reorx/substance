import { createStyles, Title, Text, Container, Box } from '@mantine/core';


const useStyles = createStyles((theme) => ({
  wrapper: {
    position: 'relative',
    paddingTop: 120,
    paddingBottom: 80,

    '@media (max-width: 755px)': {
      paddingTop: 80,
      paddingBottom: 60,
    },
  },

  inner: {
    position: 'relative',
    zIndex: 1,
  },

  dots: {
    position: 'absolute',
    color: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],

    '@media (max-width: 755px)': {
      display: 'none',
    },
  },

  dotsLeft: {
    left: 0,
    top: 0,
  },

  title: {
    textAlign: 'center',
    fontWeight: 800,
    fontSize: 40,
    letterSpacing: -1,
    color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    marginBottom: theme.spacing.xs,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,

    '@media (max-width: 520px)': {
      fontSize: 28,
      textAlign: 'left',
    },
  },

  highlight: {
    color: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6],
  },

  description: {
    textAlign: 'center',

    '@media (max-width: 520px)': {
      textAlign: 'left',
      fontSize: theme.fontSizes.md,
    },
  },
}));

export function HeroText() {
  const { classes } = useStyles();

  return (
    <Box mt={80}>
      <div className={classes.inner}>
        <Title className={classes.title}>
          Fine-tuned {' '}
          <Text component="span" className={classes.highlight} inherit>
            HTML-to-Markdown
          </Text> extractor<br/>
          for <Text component='span' td='underline'>Wikipedia</Text><br/>
          (or <Text component="span" className={classes.highlight} inherit>any website</Text>, coming soon :)
        </Title>

        <Container p={0} m={40} size={700}>
          <Text size="md" color="dimmed" className={classes.description}>
            Try it, the result will be substantial, but there's no magic. Unlike other content extraction tools like the famous <a href="https://github.com/mozilla/readability">Readability.js</a>, which implements an algorithm to find the main content, Substance provides a framework to locate and purify the actual content in HTML, giving full control over the extracting process. This allows for carefully tuning the extractor for every website. Currently, it works for Wikipedia as a proof-of-concept.
          </Text>
        </Container>
      </div>
    </Box>
  );
}
