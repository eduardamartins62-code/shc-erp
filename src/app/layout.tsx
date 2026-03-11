import type { Metadata } from 'next';
import { Providers } from './providers';
import ClientLayout from '../components/Layout';
import '../index.css';

export const metadata: Metadata = {
    title: 'ERP System',
    description: 'SHC ERP',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    <ClientLayout>{children}</ClientLayout>
                </Providers>
            </body>
        </html>
    );
}
