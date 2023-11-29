import { createTheme } from '@mui/material';

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#245398',
      light:'#7C98C1',
      dark:'#16325B',
      contrastText: '#fff'
    },
    secondary: {
      main: '#EC8C23',
      light:'#F4BA7B',
      dark:'#8E5415',
      contrastText: '#fff'
    },
    grey: {
        50: '#FBFBFB',
        100: '#EDEDEC',
        200: '#DBDBD9',
        300: '#B8B6B3',
        400: '#94928E',
        500: '#716D68',
        600: '#4D4942',
        700: '#3E3A35',
        800: '#2E2C28',
        900: '#1F1D1A',
        A700: '#0F0F0D',
    },
    text: {
        secondary: '#505F6C'
    }
  },
  typography: {
    body1: {
        fontSize: '14px'
    },
    h3: {
        fontSize: '24px',
        fontWeight: 500
    }
  }
});

export default theme;