class ResolverQueue {
  constructor() {
    this.queue = []
    this.running = false
  }

  async enqueue(job) {
    return new Promise((resolve, reject) => {
      this.queue.push({ job, resolve, reject })
      this.runNext()
    })
  }

  async runNext() {
    if (this.running) return
    if (this.queue.length === 0) return

    this.running = true
    const { job, resolve, reject } = this.queue.shift()

    try {
      const result = await job()
      resolve(result)
    } catch (err) {
      reject(err)
    } finally {
      this.running = false
      this.runNext()
    }
  }

  status() {
    return {
      running: this.running,
      queued: this.queue.length
    }
  }
}

export const resolverQueue = new ResolverQueue()
