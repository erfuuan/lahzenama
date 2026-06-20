import { memo } from 'react';

interface FooterProps {
  source?: 'live' | 'mock';
}

export default memo(function Footer({ source: _source }: FooterProps) {
  return (
    <footer className="text-center mt-8 text-[0.7rem] text-[#6c7a99] dark:text-[#4c5a7a]" />
  );
});
