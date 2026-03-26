import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MessageSquare, 
  Phone, 
  Send, 
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface HumanInLoopDialogProps {
  isOpen: boolean;
  onClose: () => void;
  moduleName: string;
  moduleContext?: string;
  onSubmit?: (data: ConsultationRequest) => Promise<void>;
}

export interface ConsultationRequest {
  moduleName: string;
  requestType: 'question' | 'call' | 'review';
  name: string;
  email: string;
  phone?: string;
  message: string;
  preferredTime?: string;
  context?: string;
}

export const HumanInLoopDialog: React.FC<HumanInLoopDialogProps> = ({
  isOpen,
  onClose,
  moduleName,
  moduleContext,
  onSubmit,
}) => {
  const [requestType, setRequestType] = useState<'question' | 'call' | 'review'>('question');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !message) {
      alert('Please fill in all required fields');
      return;
    }

    if (requestType === 'call' && !phone) {
      alert('Please provide a phone number for call requests');
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData: ConsultationRequest = {
        moduleName,
        requestType,
        name,
        email,
        phone,
        message,
        preferredTime,
        context: moduleContext,
      };

      if (onSubmit) {
        await onSubmit(requestData);
      } else {
        // Default behavior: log to console (in production, this would call an API)
        console.log('Consultation Request:', requestData);
      }

      setIsSubmitted(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to submit consultation request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRequestType('question');
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
    setPreferredTime('');
    setIsSubmitted(false);
    onClose();
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Request Submitted!</h3>
            <p className="text-sm text-muted-foreground text-center">
              Our expert consultant will review your request and get back to you within 24 hours.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Request Expert Consultation
          </DialogTitle>
          <DialogDescription>
            Need help with {moduleName}? Our expert consultants are here to assist you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Request Type Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">What type of assistance do you need?</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setRequestType('question')}
                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                  requestType === 'question'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <MessageSquare className={`h-6 w-6 ${requestType === 'question' ? 'text-primary' : 'text-gray-500'}`} />
                <span className="text-sm font-medium">Ask Question</span>
                <span className="text-xs text-muted-foreground text-center">Get answers via email</span>
              </button>

              <button
                onClick={() => setRequestType('call')}
                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                  requestType === 'call'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Phone className={`h-6 w-6 ${requestType === 'call' ? 'text-primary' : 'text-gray-500'}`} />
                <span className="text-sm font-medium">30-Min Call</span>
                <span className="text-xs text-muted-foreground text-center">Schedule a consultation</span>
              </button>

              <button
                onClick={() => setRequestType('review')}
                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                  requestType === 'review'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Users className={`h-6 w-6 ${requestType === 'review' ? 'text-primary' : 'text-gray-500'}`} />
                <span className="text-sm font-medium">Expert Review</span>
                <span className="text-xs text-muted-foreground text-center">Comprehensive review</span>
              </button>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">
                Your Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            {requestType === 'call' && (
              <div>
                <Label htmlFor="phone">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}

            {(requestType === 'call' || requestType === 'review') && (
              <div>
                <Label htmlFor="preferredTime" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Preferred Time/Date
                </Label>
                <Input
                  id="preferredTime"
                  placeholder="e.g., Next Tuesday 2-4 PM EST"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {/* Message/Question */}
          <div>
            <Label htmlFor="message">
              {requestType === 'question' ? 'Your Question' : requestType === 'call' ? 'What would you like to discuss?' : 'What would you like reviewed?'} <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder={
                requestType === 'question'
                  ? 'Describe your question or concern...'
                  : requestType === 'call'
                  ? 'Briefly describe the topics you want to cover in the call...'
                  : 'Describe what you need reviewed and any specific areas of concern...'
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Be as specific as possible to help our experts prepare for your consultation.
            </p>
          </div>

          {/* Context Badge */}
          {moduleContext && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="bg-white">Context</Badge>
                <p className="text-sm text-blue-900 flex-1">{moduleContext}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Send className="h-4 w-4 mr-2 animate-pulse" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center">
            By submitting this request, you agree to be contacted by our expert consultants.
            Response time: typically within 24 hours.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
