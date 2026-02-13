import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import PetList from "./pages/PetList";
import PetDetail from "./pages/PetDetail";
import Discover from "./pages/Discover";
import PetProfile from "./pages/PetProfile";
import Chat from "./pages/Chat";
import Mine from "./pages/Mine";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<PetList />} />
            <Route path="/pet/:id" element={<PetDetail />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/profile/:id" element={<PetProfile />} />
            <Route path="/chat/:petId" element={<Chat />} />
            <Route path="/mine" element={<Mine />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
