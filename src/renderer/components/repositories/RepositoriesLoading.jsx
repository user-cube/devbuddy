import React from 'react'
import Loading from '../layout/Loading'

const RepositoriesLoading = ({ selectedFolder, selectedDirectory }) => {
  const message = selectedFolder
    ? 'Loading repository information...'
    : selectedDirectory
      ? `Loading folders from ${selectedDirectory.path}...`
      : 'Loading repositories...'

  return <Loading fullScreen message={message} />
}

export default RepositoriesLoading
