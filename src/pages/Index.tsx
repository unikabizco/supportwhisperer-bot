
import ChatContainer from "@/components/ChatBot/ChatContainer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to Our Support Center
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have a question? Our AI-powered chatbot is here to help. Click the chat bubble in the bottom right to get started.
          </p>
        </div>
      </div>
      <ChatContainer />
    </div>
  );
};

export default Index;
