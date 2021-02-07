import Head from 'next/head'
import css from './index.less'
import { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import processClippings from '../services/processClippings'

export default function Home() {
  const [files, setFiles] = useState([])
  const [books, setBooks] = useState({})
  const { getRootProps, getInputProps } = useDropzone({
    accept: '.txt',
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, { preview: URL.createObjectURL(file) }),
        ),
      )
    },
  })

  useEffect(
    () => () => {
      // Make sure to revoke the data uris to avoid memory leaks
      files.forEach((file) => URL.revokeObjectURL(file.preview))
    },
    [files],
  )

  useEffect(() => {
    files.forEach((file) => {
      const reader = new FileReader()

      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
        const b = processClippings(reader.result)
        console.log(b)
        setBooks(b)
      }
      reader.readAsText(file)
    })
  }, [files])

  return (
    <div className={css.container}>
      <Head>
        <title>Kindle Clippings Processor</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={css.main}>
        <h1>Kindle Clippings Processor</h1>

        {Object.keys(books).length ? (
          <div>
            {Object.keys(books).map((title) => (
              <div key={title}>
                <h2>{title}</h2>
                <article>
                  {books[title].map((p) => (
                    <p>{p}</p>
                  ))}
                </article>
              </div>
            ))}
          </div>
        ) : (
          <div className={css.intro}>
            <p>
              Select "My Clippings.txt" to have your clippings grouped by book
              title and sorted by location and timestamp.
            </p>
            <div {...getRootProps({ className: css.dropzone })}>
              <input {...getInputProps()} />
              <button>Select File</button>
            </div>
          </div>
        )}
      </main>

      <footer className={css.footer}>
        <p>
          Made by{' '}
          <a href="https://luxiyalu.com/about" target="_blank">
            Lucia
          </a>
        </p>
      </footer>
    </div>
  )
}
