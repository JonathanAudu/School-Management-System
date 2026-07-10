export function getImageUrl(path: string | undefined | null): string {
    if (!path) return '';
    // If it's already an absolute URL or data URI, return as-is
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
        return path;
    }
    // Otherwise, prepend the backend URL and storage path
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const cleanPath = path.replace(/^\//, ''); // Remove leading slash if any
    return `${baseUrl}/storage/${cleanPath}`;
}
