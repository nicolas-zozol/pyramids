import {FC, FormEvent, useState} from 'react'

interface Props {

}

function encode(data: any) {
  return Object.keys(data)
    .map(
      (key) =>
        encodeURIComponent(key) + '=' + encodeURIComponent(data[key])
    )
    .join('&')
}

export const MailingListForm: FC<Props> = () => {
  const [registered, setRegisterer] = useState(false)
  const [email, setEmail] = useState('')


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    console.log(e.target)
    console.log('sending data', e, email)


    fetch('/', {
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      method: 'POST',
      body: encode({email, 'form-name': 'mailing-list'})
    })
      .then(() => {
        console.log('Correctly submitted email ', e)
        setEmail('')
        setRegisterer(true)
      })
      .catch(console.error)
    return false
  }


  return (
    <div>
      {!registered &&

      <form method="post" data-netlify="true" data-netlify-honeypot="bot-field"
            name="mailing-list"
            onSubmit={handleSubmit}
      >
        <label>
          Want to read the next A+ article ? Subscribe to our rare newsletter.
          <input name="email" type="email" value={email}
                 onChange={(e) => {
                   console.log(e.target.value)
                   setEmail(e.target.value)
                 }
                 }/>
          <input type="hidden" name="form-name" value="mailing-list"/>
        </label>
        <button type="submit">Submit</button>
      </form>

      }
      {
        registered && <div className={'text-center'}>✉️ Registered successfully 👍</div>
      }

    </div>
  )
}