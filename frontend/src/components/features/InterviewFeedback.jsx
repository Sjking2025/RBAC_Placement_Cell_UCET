import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Loader2,
  User,
  CheckCircle,
  XCircle
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const InterviewFeedback = ({ interviewId, candidateName, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({
    rating: 0,
    technicalSkills: 3,
    communication: 3,
    problemSolving: 3,
    cultureFit: 3,
    recommendation: '',
    strengths: '',
    weaknesses: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.recommendation) {
      toast.error('Please select a recommendation');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/interviews/${interviewId}/feedback`, {
        rating: feedback.rating,
        technicalSkills: feedback.technicalSkills,
        communication: feedback.communication,
        problemSolving: feedback.problemSolving,
        cultureFit: feedback.cultureFit,
        recommendation: feedback.recommendation,
        strengths: feedback.strengths,
        weaknesses: feedback.weaknesses,
        notes: feedback.notes
      });
      toast.success('Feedback submitted!');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const setRating = (value) => {
    setFeedback({ ...feedback, rating: value });
  };

  const RatingSlider = ({ label, value, onChange }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">{value}/5</span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Interview Feedback
        </CardTitle>
        {candidateName && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <User className="h-4 w-4" />
            <span>{candidateName}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Overall Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 transition-colors ${
                    star <= feedback.rating ? 'text-yellow-500' : 'text-muted-foreground/30'
                  }`}
                >
                  <Star className="h-8 w-8 fill-current" />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {feedback.rating > 0 ? `${feedback.rating}/5` : 'Select rating'}
              </span>
            </div>
          </div>

          {/* Skill Ratings */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Skill Assessment</h4>
            <RatingSlider
              label="Technical Skills"
              value={feedback.technicalSkills}
              onChange={(v) => setFeedback({ ...feedback, technicalSkills: v })}
            />
            <RatingSlider
              label="Communication"
              value={feedback.communication}
              onChange={(v) => setFeedback({ ...feedback, communication: v })}
            />
            <RatingSlider
              label="Problem Solving"
              value={feedback.problemSolving}
              onChange={(v) => setFeedback({ ...feedback, problemSolving: v })}
            />
            <RatingSlider
              label="Culture Fit"
              value={feedback.cultureFit}
              onChange={(v) => setFeedback({ ...feedback, cultureFit: v })}
            />
          </div>

          {/* Recommendation */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Recommendation *</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'strongly_recommend', label: 'Strongly Recommend', icon: ThumbsUp, color: 'text-green-600' },
                { value: 'recommend', label: 'Recommend', icon: CheckCircle, color: 'text-blue-600' },
                { value: 'not_recommend', label: 'Not Recommend', icon: XCircle, color: 'text-red-600' }
              ].map(({ value, label, icon: Icon, color }) => (
                <label
                  key={value}
                  className={`p-4 border rounded-lg cursor-pointer text-center transition-colors ${
                    feedback.recommendation === value
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="recommendation"
                    value={value}
                    checked={feedback.recommendation === value}
                    onChange={(e) => setFeedback({ ...feedback, recommendation: e.target.value })}
                    className="sr-only"
                  />
                  <Icon className={`h-6 w-6 mx-auto mb-2 ${color}`} />
                  <span className="text-sm font-medium">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Strengths</label>
              <textarea
                value={feedback.strengths}
                onChange={(e) => setFeedback({ ...feedback, strengths: e.target.value })}
                placeholder="Key strengths observed..."
                className="w-full h-24 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Areas for Improvement</label>
              <textarea
                value={feedback.weaknesses}
                onChange={(e) => setFeedback({ ...feedback, weaknesses: e.target.value })}
                placeholder="Areas that need improvement..."
                className="w-full h-24 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Notes</label>
            <textarea
              value={feedback.notes}
              onChange={(e) => setFeedback({ ...feedback, notes: e.target.value })}
              placeholder="Any other observations or comments..."
              className="w-full h-24 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Feedback
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default InterviewFeedback;
