import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';

interface DeepLinkResult {
  keyword: string | null;
  shouldNavigate: boolean;
}

export function useDeepLink(handler: (keyword: string) => void) {
  const router = useRouter();

  useEffect(() => {
    const handleInitialURL = async () => {
      const initialURL = await Linking.getInitialURL();
      if (initialURL) {
        processURL(initialURL);
      }
    };

    const processURL = (url: string) => {
      try {
        const parsed = Linking.parse(url);
        const queryParams = parsed.queryParams;
        
        if (queryParams?.q) {
          const keyword = queryParams.q as string;
          handler(keyword);
        } else if (queryParams?.keyword) {
          const keyword = queryParams.keyword as string;
          handler(keyword);
        }
      } catch (error) {
        console.error('Error parsing URL:', error);
      }
    };

    handleInitialURL();

    const subscription = Linking.addEventListener('url', (event) => {
      processURL(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, [handler]);
}

export function getDeepLinkKeyword(): string | null {
  return null;
}