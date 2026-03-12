import { Suspense } from 'react';
import LoginForm from './LoginForm';

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
                    <div className="animate-pulse text-gray-600">Loading...</div>
                </div>
            }
        >
            <LoginForm />
        </Suspense>
    );
}
