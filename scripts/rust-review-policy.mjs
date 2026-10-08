/** A review is permission only when its decision and exact component binding agree. */
export function approvedReview(component, reviews, purpose) {
  return reviews.some((review) =>
    review.status === 'approved' && review.needsDecision === false &&
    review.name === component.name && review.version === component.version &&
    review.license === component.license && review.repository === component.repository &&
    Boolean(component.sourceId) && review.sourceId === component.sourceId &&
    (purpose !== 'notice' || (Boolean(review.expiresAt) && review.expiresAt >= new Date().toISOString().slice(0, 10) && Boolean(review.evidence))) &&
    review.purposes?.includes(purpose) && Boolean(review.decidedBy) && Boolean(review.decidedAt) && Boolean(review.reason)
  )
}

export function unresolvedReviews(components, reviews) {
  return reviews.filter((review) => components.some((component) =>
    component.name === review.name && component.version === review.version
  ) && (!['approved', 'resolved'].includes(review.status) || review.needsDecision !== false))
}
