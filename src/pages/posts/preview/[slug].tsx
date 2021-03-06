import { useEffect } from "react"
import { GetStaticPaths, GetStaticProps } from "next"
import { useSession } from "next-auth/client"
import { RichText } from "prismic-dom"
import { useRouter } from "next/router"
import { getPrismicClient } from "../../../services/prismic"
import Head from 'next/head'
import Link from "next/link"
import styles from '../post.module.scss'

interface PostPreviewProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  }
}

export default function Post({ post }: PostPreviewProps) {
  const [session] = useSession()
  const { push } = useRouter()

  useEffect(() => {
    if (session?.activeSubscription) {
      push(`/posts/${post.slug}`)
    }
  }, [session, post.slug, push])

  return (
    <>
      <Head>
        <title>{post.title} | IncrediNews</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div
            className={`${styles.postContent} ${styles.previewContent}`}  
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className={styles.continueReading}>
            Wanna continue reading?
            <Link href="/">
              <a href="">Subscribe now 🤗</a>            
            </Link>
          </div>
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params

  const prismic = getPrismicClient()

  const response = await prismic.getByUID('post', String(slug), {})

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content.splice(0, 3)),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return {
    props: {
      post
    },
    revalidate: 86400
  }
}