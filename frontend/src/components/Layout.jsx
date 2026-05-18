import Navbar from "./Navbar";
import Chatbot from "./Chatbot";

function Layout({ children }) {
  return (
    <div className="app-root">
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />

      <div className="app-shell">
        <Navbar />
        <main className="app-main">{children}</main>
        <Chatbot />
      </div>
    </div>
  );
}

export default Layout;

