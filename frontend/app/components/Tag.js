import React from 'react';
import { Topic, Sentiment, Priority } from '../types';

const Tag = ({ type, value }) => {
  const getTagStyles = () => {
    switch (type) {
      case 'topic':
        return {
          backgroundColor: '#dbeafe',
          color: '#1e40af'
        };
      case 'sentiment':
        switch (value) {
          case Sentiment.FRUSTRATED:
          case Sentiment.ANGRY:
            return {
              backgroundColor: '#fef2f2',
              color: '#dc2626'
            };
          case Sentiment.CURIOUS:
            return {
              backgroundColor: '#ecfdf5',
              color: '#059669'
            };
          default:
            return {
              backgroundColor: '#f9fafb',
              color: '#6b7280'
            };
        }
      case 'priority':
        switch (value) {
          case Priority.P0:
            return {
              backgroundColor: '#fef2f2',
              color: '#dc2626'
            };
          case Priority.P1:
            return {
              backgroundColor: '#fef3c7',
              color: '#d97706'
            };
          case Priority.P2:
            return {
              backgroundColor: '#f0f9ff',
              color: '#0284c7'
            };
          default:
            return {
              backgroundColor: '#f9fafb',
              color: '#6b7280'
            };
        }
      default:
        return {
          backgroundColor: '#f9fafb',
          color: '#6b7280'
        };
    }
  };

  const tagStyles = getTagStyles();

  return (
    <span
      style={{
        padding: '0.25rem 0.5rem',
        backgroundColor: tagStyles.backgroundColor,
        color: tagStyles.color,
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '500',
        display: 'inline-block'
      }}
    >
      {value}
    </span>
  );
};

export default Tag;
