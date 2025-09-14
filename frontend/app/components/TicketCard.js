import React from 'react';
import Tag from './Tag';
import { Priority, Sentiment, Topic } from '../types';

const TicketCard = ({ ticket, isLoading }) => {
  if (isLoading) {
    return (
      <div style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '1rem'
      }}>
        <div style={{
          height: '1rem',
          backgroundColor: '#cbd5e1',
          borderRadius: '4px',
          width: '75%',
          marginBottom: '0.5rem'
        }}></div>
        <div style={{
          height: '0.75rem',
          backgroundColor: '#cbd5e1',
          borderRadius: '4px',
          width: '50%',
          marginBottom: '1rem'
        }}></div>
        <div style={{ marginBottom: '0.5rem' }}>
          <div style={{
            height: '0.75rem',
            backgroundColor: '#e2e8f0',
            borderRadius: '4px',
            marginBottom: '0.5rem'
          }}></div>
          <div style={{
            height: '0.75rem',
            backgroundColor: '#e2e8f0',
            borderRadius: '4px',
            marginBottom: '0.5rem'
          }}></div>
          <div style={{
            height: '0.75rem',
            backgroundColor: '#e2e8f0',
            borderRadius: '4px',
            width: '83%'
          }}></div>
        </div>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid #e2e8f0'
        }}>
          <div style={{
            height: '1.5rem',
            width: '5rem',
            backgroundColor: '#cbd5e1',
            borderRadius: '12px'
          }}></div>
          <div style={{
            height: '1.5rem',
            width: '6rem',
            backgroundColor: '#cbd5e1',
            borderRadius: '12px'
          }}></div>
          <div style={{
            height: '1.5rem',
            width: '4rem',
            backgroundColor: '#cbd5e1',
            borderRadius: '12px'
          }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      transition: 'box-shadow 0.2s',
      cursor: 'default'
    }}
    onMouseEnter={(e) => {
      e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    }}
    onMouseLeave={(e) => {
      e.target.style.boxShadow = 'none';
    }}
    >
      <div>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: '600',
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {ticket.id}
        </span>
        <h4 style={{
          fontWeight: 'bold',
          color: '#1f2937',
          marginTop: '0.25rem',
          marginBottom: '0.5rem',
          fontSize: '1rem',
          lineHeight: '1.4'
        }}>
          {ticket.subject}
        </h4>
        <p style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          marginTop: '0.5rem',
          marginBottom: '1rem',
          lineHeight: '1.5',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {ticket.body}
        </p>
      </div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid #e5e7eb'
      }}>
        {ticket.topic && ticket.sentiment && ticket.priority ? (
          <>
            <Tag type="topic" value={ticket.topic} />
            <Tag type="sentiment" value={ticket.sentiment} />
            <Tag type="priority" value={ticket.priority} />
          </>
        ) : (
          <span style={{
            fontSize: '0.875rem',
            color: '#dc2626'
          }}>
            Classification failed
          </span>
        )}
      </div>
    </div>
  );
};

export default TicketCard;
