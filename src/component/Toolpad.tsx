
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import DescriptionIcon from '@mui/icons-material/Description';
import LayersIcon from '@mui/icons-material/Layers';

import FullscreenIcon from '@mui/icons-material/Fullscreen';
import SlideshowIcon from '@mui/icons-material/Slideshow';

import { AppProvider, type Navigation } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';

import Dashboard from './Dashboard';
import { ComponentType, useEffect, useState, useRef, useContext  } from 'react';
import MainGrid from './mainGrid';
import TestGrid from './TestGrid';
import { useControls, button, buttonGroup, folder } from 'leva'



const NAVIGATIONbackup: Navigation = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    segment: 'dashboard',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    segment: 'orders',
    title: 'Orders',
    icon: <ShoppingCartIcon />,
  },
  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'Analytics',
  },
  {
    segment: 'reports',
    title: 'Reports',
    icon: <BarChartIcon />,
    children: [
      {
        segment: 'sales',
        title: 'Sales',
        icon: <DescriptionIcon />,
      },
      {
        segment: 'traffic',
        title: 'Traffic',
        icon: <DescriptionIcon />,
      },
    ],
  },
  {
    segment: 'integrations',
    title: 'Integrations',
    icon: <LayersIcon />,
  },
];

const pages = ['dashboard', '1', 'test', '3'];
const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: '主要設定',
  },
  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: '投影片',
  },
  {
    segment: 'slice',
    title: '內容',
    icon: <BarChartIcon />,
    children: pages.map((page, index) => {
      return {
        segment: page,
        title: page,
        icon: <LayersIcon />
      }
    })
  },
];

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

const components: Record<string, ComponentType> = {
  '/slice/dashboard': Dashboard,
  '/slice/1': MainGrid,
  '/slice/test': TestGrid,
};
function DemoPageContent({ router, isFullScreen, setIsFullScreen, setCount } 
  : { router: any, isFullScreen: boolean, setIsFullScreen: (value: boolean) => void, setCount: Function }) {
  const Component = components[router.pathname] || (() => <Typography>NotFound</Typography>);
  const [page, setPage] = useState(0);
  const [reRender, setReRender] = useState(0);
  const slices = useRef<string[]>(pages);
  const controls = useControls({
    開始投影片: button(()=>{
      setPage(0);
      router.pathname = '/slice/' + slices.current[0];
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
        setIsFullScreen(true);
      } else {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }, { disabled: isFullScreen }),
    螢幕設定: buttonGroup({
      label: <FullscreenIcon/>,
      opts: {
        'F11': () => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
              console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
          }
          setIsFullScreen(true)
        },
        '退出全螢幕': () => {
          document.exitFullscreen();
          setIsFullScreen(false);
        },
      }
    }),
    投影: buttonGroup({
      label: <SlideshowIcon/>,
      opts: {
        '上一頁': () => {
          setPage((prevPage) => {
            if (prevPage === 0) return prevPage;
            const newPage = prevPage - 1;
            router.pathname = '/slice/' + slices.current[newPage];
            console.log(newPage, router.pathname);
            setCount((prev: number) => prev + 1);
            return newPage;
          });
        },
        '下一頁': () => {
          setPage((prevPage) => {
            if (prevPage + 1 === slices.current.length) return prevPage;
            const newPage = prevPage + 1;
            router.pathname = '/slice/' + slices.current[newPage];
            console.log(newPage, router.pathname);
            setCount((prev: number) => prev + 1);
            return newPage;
          });
          // if(page == slices.current.length) return;
          // setPage(page + 1);
          // router.pathname = '/slice/' + slices.current[page + 1];
          // console.log(page + 1, router.pathname);
        },
      }
    }),
    頁面設定: folder(
      {
      ...Object.fromEntries(pages.map((page, index) => [
        page, 
        { value: true, label: page}
      ])),
      套用: button(() => {
        setReRender((prev) => prev + 1);
      })
      }, { collapsed: true}),
  },
)
  useEffect(() => {
    slices.current = pages.filter((page) => (controls as any)[page] == true);
  }, [reRender]);
  
  return (
    <>
      {/* <Box
        sx={{
          py: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography>Dashboard content for {pathname}</Typography>
      </Box> */}
      <Component></Component>
    </>
  );
}

export default function Toolpad() {
  const router = useDemoRouter('/slice/dashboard');
  useEffect(()=>{
    router.pathname = '/slice/1';
  }, []);
  const [count, setCount] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  return (
    <>
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      theme={theme}
      branding={{
        logo: <img src="https://mui.com/static/logo.png" alt="MUI logo" />,
        title: 'JERRY',
      }}

    >
      <DashboardLayout>
        {!isFullScreen && <DemoPageContent router={router} isFullScreen={isFullScreen} setIsFullScreen={setIsFullScreen} setCount={setCount}/>}
      </DashboardLayout>
    </AppProvider>

    
    {isFullScreen && <div style={{position:'fixed', top: 0, zIndex: 1202, width:'100%', height:'100%', backgroundColor: 'lightgrey'}}>
      <DemoPageContent router={router} isFullScreen={isFullScreen} setIsFullScreen={setIsFullScreen} setCount={setCount} />
    </div>}
    </>
  );
}