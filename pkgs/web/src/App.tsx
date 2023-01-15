import { HomePage } from './pages/Home';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ExtractorPage } from './pages/Extractor';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage/>,
  },
  {
    path: '/extractor',
    element: <ExtractorPage/>,
  }
])

export function App() {
  return (
    <RouterProvider router={router} />
  );
}
