import React from 'react'
import BitbucketPRCard from './BitbucketPRCard'
import BitbucketEmpty from './BitbucketEmpty'

const BitbucketPRList = ({ pullRequests, searchQuery, filter, onPRClick }) => {
  if (pullRequests.length === 0) {
    return <BitbucketEmpty searchQuery={searchQuery} filter={filter} />
  }

  return (
    <div className="space-y-4">
      {pullRequests.map((pr) => (
        <BitbucketPRCard 
          key={pr.id} 
          pullRequest={pr} 
          onClick={onPRClick}
        />
      ))}
    </div>
  )
}

export default BitbucketPRList
