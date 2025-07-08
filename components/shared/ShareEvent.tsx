"use client"

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Share, 
  Copy, 
  Mail, 
  MessageCircle, 
  Facebook, 
  Twitter,
  Check
} from 'lucide-react';
import { toast } from 'sonner'; 

interface ShareEventProps {
  eventId: string;
  eventTitle: string;
  eventDescription?: string;
  children?: React.ReactNode;
}

export const ShareEvent = ({ eventId, eventTitle, eventDescription, children }: ShareEventProps) => {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [eventUrl, setEventUrl] = useState('');

  // Set up the event URL and check for Web Share API support
  useEffect(() => {
    // This code only runs on the client side
    setEventUrl(`${window.location.origin}/events/${eventId}`);
    
    // Check for Web Share API support
    setCanNativeShare(!!navigator.share);
  }, [eventId]);
  
  // Share text
  const shareText = `Check out this event: ${eventTitle}`;
  const shareDescription = eventDescription ? ` - ${eventDescription}` : '';
  const fullShareText = `${shareText}${shareDescription}`;

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  // Initialize client-side state
  useEffect(() => {
    setCanNativeShare(!!navigator.share);
  }, []);

  // Share via Web Share API (mobile-friendly)
  const handleNativeShare = async () => {
    if (canNativeShare) {
      try {
        await navigator.share({
          title: eventTitle,
          text: fullShareText,
          url: eventUrl,
        });
      } catch (err) {
        // Share was cancelled
        console.log('Share cancelled');
      }
    }
  };

  // Share to specific platforms
  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${fullShareText} ${eventUrl}`)}`;
    window.open(url, '_blank');
  };

  const shareToSMS = () => {
    const url = `sms:?body=${encodeURIComponent(`${fullShareText} ${eventUrl}`)}`;
    window.open(url);
  };

  const shareToEmail = () => {
    const subject = encodeURIComponent(`Event: ${eventTitle}`);
    const body = encodeURIComponent(`${fullShareText}\n\n${eventUrl}`);
    const url = `mailto:?subject=${subject}&body=${body}`;
    window.open(url);
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullShareText)}&url=${encodeURIComponent(eventUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="p-2">
            <Share className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="
        w-[90vw] max-w-xs mx-auto
        bg-white p-3 rounded-lg
        max-h-[90vh] overflow-y-auto
      ">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg font-semibold text-gray-900 text-center">
            Share Event
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Copy Link Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-50 rounded-lg p-2 text-xs text-gray-700 border border-gray-200 min-h-[36px] flex items-center overflow-hidden">
                <span className="truncate">
                  {eventUrl.substring(0, 15)}...{eventUrl.substring(eventUrl.length - 10)}
                </span>
              </div>
              <Button
                variant="outline"
                size="default"
                onClick={copyToClipboard}
                className="
                  flex-shrink-0 h-9 px-2.5
                  bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700
                  text-xs font-medium whitespace-nowrap
                "
                title="Copy link"
              >
                {copied ? (
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                <span className="sm:hidden lg:inline">
                  {copied ? 'Copied!' : 'Copy Link'}
                </span>
                <span className="hidden sm:inline lg:hidden">
                  {copied ? 'Copied!' : 'Copy'}
                </span>
              </Button>
            </div>
          </div>

          {/* Native Share (if available) */}
          {canNativeShare && (
            <div className="sm:hidden">
              <Button
                variant="outline"
                onClick={handleNativeShare}
                className="w-full h-11 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 font-medium"
              >
                <Share className="w-4 h-4 mr-2" />
                Share via...
              </Button>
            </div>
          )}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or share to</span>
            </div>
          </div>

          {/* Share Options Grid */}
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { 
                label: 'WhatsApp', 
                shortLabel: 'WhatsApp',
                icon: <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />, 
                onClick: shareToWhatsApp,
                bgColor: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700'
              },
              { 
                label: 'SMS', 
                shortLabel: 'SMS',
                icon: <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />, 
                onClick: shareToSMS,
                bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
              },
              { 
                label: 'Email', 
                shortLabel: 'Email',
                icon: <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />, 
                onClick: shareToEmail,
                bgColor: 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
              },
              { 
                label: 'Facebook', 
                shortLabel: 'Facebook',
                icon: <Facebook className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />, 
                onClick: shareToFacebook,
                bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
              },
              { 
                label: 'Twitter', 
                shortLabel: 'Twitter',
                icon: <Twitter className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />, 
                onClick: shareToTwitter,
                bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
              }
            ].map(({ label, shortLabel, icon, onClick, bgColor }) => (
              <Button
                key={label}
                variant="outline"
                onClick={onClick}
                className={`
                  h-9
                  ${bgColor}
                  border font-medium
                  flex items-center justify-center 
                  gap-1.5
                  p-1.5
                  text-xs
                  hover:opacity-90
                `}
              >
                {icon}
                <span className="text-[11px] whitespace-nowrap">
                  {shortLabel}
                </span>
              </Button>
            ))}
          </div>

          {/* Large Screen Native Share */}
          {canNativeShare && (
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={handleNativeShare}
                className="w-full h-9 bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700 text-xs"
              >
                <Share className="w-4 h-4 mr-2" />
                More options
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};