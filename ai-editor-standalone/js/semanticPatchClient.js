/**
 * Semantic Patch Client
 * Frontend integration for intelligent code modification
 * Handles user instructions and applies patches without full project context
 */

class SemanticPatchClient {
  constructor(apiEndpoint = 'http://localhost:5000') {
    this.apiEndpoint = apiEndpoint
    this.isProcessing = false
  }

  /**
   * Log with timestamp and prefix
   */
  log(message, data = null) {
    const timestamp = new Date().toLocaleTimeString()
    console.log(`[${timestamp}] [PATCH-CLIENT] ${message}`, data || '')
  }

  /**
   * Request semantic patches from server
   * @param {string} instruction - User's natural language instruction
   * @param {Object} files - All project files
   * @returns {Promise<Object>} - Patch results
   */
  async requestPatches(instruction, files) {
    if (this.isProcessing) {
      this.log('⚠️ Patch request already in progress')
      return { error: 'Request already in progress' }
    }

    this.isProcessing = true
    this.log(`📝 Processing instruction: "${instruction}"`)

    try {
      const response = await fetch(`${this.apiEndpoint}/semantic-patch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instruction,
          files
        })
      })

      if (!response.ok) {
        const error = await response.json()
        this.log(`❌ Server error: ${error.error}`)
        return { error: error.error, details: error.details }
      }

      const result = await response.json()

      this.log(`✅ Patches applied successfully`)
      this.log(`📊 Results:`, {
        applied: result.results.applied.length,
        failed: result.results.failed.length,
        filesModified: result.results.filesModified
      })

      return result
    } catch (error) {
      this.log(`❌ Network error: ${error.message}`)
      return { error: error.message }
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Apply patches to local files
   * @param {Object} files - Current files object
   * @param {Object} patchResult - Result from server
   * @returns {Object} - Updated files
   */
  applyPatchesToFiles(files, patchResult) {
    if (patchResult.error) {
      this.log(`Cannot apply patches: ${patchResult.error}`)
      return files
    }

    // Server already applied patches, just return the updated files
    return patchResult.files || files
  }

  /**
   * Show patch summary to user
   * @param {Object} result - Patch result
   * @returns {string} - Human-readable summary
   */
  getSummary(result) {
    if (result.error) {
      return `❌ Error: ${result.error}`
    }

    const { applied, failed } = result.results
    let summary = `✅ Applied ${applied.length} patch${applied.length !== 1 ? 'es' : ''}`

    if (applied.length > 0) {
      summary += '\n\nModified files:'
      applied.forEach(patch => {
        summary += `\n  • ${patch.filePath} (${patch.changes} line${patch.changes !== 1 ? 's' : ''})`
      })
    }

    if (failed.length > 0) {
      summary += `\n\n⚠️ Failed patches: ${failed.length}`
      failed.forEach(patch => {
        summary += `\n  • ${patch.filePath}: ${patch.reason}`
      })
    }

    return summary
  }
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SemanticPatchClient
}
