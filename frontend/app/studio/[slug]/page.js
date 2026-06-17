import { API } from '../../../lib/api';
import StudioPageUI from '../../../components/StudioPage';

// ── data fetching logic unchanged ──────────────────────────────────────────
async function getStudio(slug) {
    try {
        const business = await publicAPI.getStudio(slug);
        return business;
    } catch (error) {
        console.error('Error fetching studio:', error);
        return null;
    }
}
export default async function Studio({ params }) {
    const { slug } = await params;
    const b = await getStudio(slug);

    if (!b) {
        return (
            <main style={{ padding: 40, fontFamily: 'system-ui', color: '#555' }}>
                Studio not found.
            </main>
        );
    }

    return <StudioPageUI b={b} />;
}