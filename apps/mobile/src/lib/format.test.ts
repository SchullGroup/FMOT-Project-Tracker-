import { ladder, lagosToday, reportSentToday, type MySubmission } from './field';
import { formatChainage, greetingName, inviteToken, localNumber, lotsLabel } from './format';

const item = (over: Partial<MySubmission>): MySubmission => ({
  id: 'x', clientId: 'c', chainageM: null, chainage: null, discipline: null, capturedAt: '2026-11-03T08:59:00Z', reviewedBy: null, reviewedAt: null, lotId: 'l',
  kind: 'photo', status: 'pending_re', supersedesId: null, reportDate: null, receivedAt: '2026-11-03T09:00:00Z', returnReason: null, ...over,
});

describe('format', () => {
  it('takes the short invite code however it is typed', () => {
    expect(inviteToken('abcd 2345')).toBe('ABCD-2345');
    expect(inviteToken(' ABCD-2345 ')).toBe('ABCD-2345');
  });
  it('takes the invite code from a pasted link or the code itself', () => {
    expect(inviteToken('Emeka, you have been invited. Open https://tracker.example/invite/0b2e.AbC_d-9 within 72 hours')).toBe('0b2e.AbC_d-9');
    expect(inviteToken('  0b2e.AbC_d-9 \n')).toBe('0b2e.AbC_d-9');
  });
  it('names lots in a run as the board does', () => {
    expect(lotsLabel(['Lot 1', 'Lot 2', 'Lot 3'])).toBe('Lots 1 to 3');
    expect(lotsLabel(['Lot 1', 'Lot 3'])).toBe('Lot 1 and Lot 3');
    expect(lotsLabel(['Lot 1', 'Lot 2'])).toBe('Lots 1 and 2');
    expect(lotsLabel(['Lot 2'])).toBe('Lot 2');
  });
  it('greets by title and surname, or by first name', () => {
    expect(greetingName('Engr. T. Adeyemi')).toBe('Engr. Adeyemi');
    expect(greetingName('Musa Garba')).toBe('Musa');
  });
  it('writes numbers and chainage as people do', () => {
    expect(localNumber('+2347000000112')).toBe('07000000112');
    expect(formatChainage(150_301)).toBe('km 150+301');
  });
});

describe('the photo status ladder', () => {
  it('counts sent, verified and sent back, leaving out items already retaken', () => {
    const items = [
      item({ id: 'a', status: 'pending_re' }),
      item({ id: 'b', status: 'checked' }),
      item({ id: 'c', status: 'verified' }),
      item({ id: 'd', status: 'sent_back', returnReason: { code: 'blurred', label: 'Photo unclear' } }),
      item({ id: 'e', status: 'sent_back', returnReason: { code: 'wrong_place', label: 'Wrong place' } }),
      item({ id: 'f', status: 'pending_re', supersedesId: 'e' }),
    ];
    expect(ladder(items)).toEqual({ queued: 0, sent: 3, verified: 1, sentBack: 1, firstReason: 'Photo unclear' });
  });
  it("knows whether today's report has been sent, by Lagos date", () => {
    const today = lagosToday(new Date('2026-11-03T23:30:00Z'));
    expect(today).toBe('2026-11-04');
    expect(reportSentToday([item({ kind: 'daily_report', reportDate: '2026-11-04' })], today)).toBe(true);
    expect(reportSentToday([item({ kind: 'daily_report', reportDate: '2026-11-03' })], today)).toBe(false);
  });
});
