import axios from 'axios';
import { Outlet } from 'react-router-dom';
import Navbar from './Components/utils/Navbar';
import Footer from './Components/utils/Footer';
import { Toaster } from 'react-hot-toast';
const publicAxiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api/',
  withCredentials: false, // If your backend requires credentials
});
// all components can access publicAxiosInstance
// example: publicAxiosInstance.get(`/blog?page=${page}&limit=6`)
function App() {
  return (
    // add navbar and footer in this file
    <div>
      <Navbar />
      <Toaster position="top-center" reverseOrder={false} />
      <main className='body'>
        <Outlet context={{
          publicAxiosInstance
        }} />
      </main>
      <Footer />
    </div>
  );
}

export default App;
