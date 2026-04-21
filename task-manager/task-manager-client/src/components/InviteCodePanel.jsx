import { useState, useEffect } from 'react';
import { getInviteCode } from '../services/api';

export default function InviteCodePanel() {
  const [code, setCode]       = useState('');
  const [orgName, setOrgName] = useState('');
  const [copied, setCopied]   = useState(false);
  const [show, setShow]       = useState(false);

  useEffect(() => {
    getInviteCode()
      .then((res) => {
        setCode(res.data.data.inviteCode);
        setOrgName(res.data.data.orgName);
      })
      .catch(() => {});
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!code) return null;

  // Display code in 4 groups of 8 for readability: XXXXXXXX XXXXXXXX XXXXXXXX XXXXXXXX
  const formatted = code.match(/.{1,8}/g)?.join(' ') ?? code;

  return (
    <div style={{
      background: 'var(--primary-light)',
      border: '1.5px solid var(--primary)',
      borderRadius: 'var(--radius)',
      padding: '14px 16px',
      marginBottom: '20px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '2px' }}>
            🔑 ORGANIZATION INVITE CODE
          </p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Share with members to join <strong>{orgName}</strong>
          </p>
        </div>
        <button
          onClick={() => setShow(!show)}
          className="btn btn-sm btn-primary"
        >
          {show ? 'Hide' : 'Show Code'}
        </button>
      </div>

      {show && (
        <>
          <div style={{
            marginTop: '12px',
            background: 'var(--surface)',
            border: '1.5px dashed var(--primary)',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexWrap: 'wrap',
          }}>
            <code style={{
              fontSize: '0.82rem',
              fontFamily: 'monospace',
              color: 'var(--primary)',
              fontWeight: 700,
              letterSpacing: '2px',
              wordBreak: 'break-all',
            }}>
              {formatted}
            </code>
            <button
              onClick={handleCopy}
              className="btn btn-sm btn-primary"
              style={{ flexShrink: 0 }}
            >
              {copied ? '✅ Copied!' : '📋 Copy'}
            </button>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '8px' }}>
            Member goes to <strong>Register → Join Organization</strong> and pastes this code.
            Keep it private — anyone with this code can join your org.
          </p>
        </>
      )}
    </div>
  );
}
