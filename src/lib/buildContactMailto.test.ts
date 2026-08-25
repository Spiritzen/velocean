import { describe, expect, it } from 'vitest'
import { buildContactMailto } from './buildContactMailto'

describe('buildContactMailto', () => {
  const values = {
    name: 'Camille Dupont',
    email: 'camille@example.com',
    subject: 'Vélo',
    message: 'Bonjour, je souhaite faire régler mon vélo avant l’été.',
  }

  it('cible bonjour@velocean.fr', () => {
    expect(buildContactMailto(values)).toMatch(/^mailto:bonjour@velocean\.fr\?/)
  })

  it('encode le nom, l’email, le sujet et le message dans la requête', () => {
    const mailto = buildContactMailto(values)
    const [, query] = mailto.split('?')
    const params = new URLSearchParams(query)

    expect(params.get('subject')).toContain('Vélo')
    expect(params.get('body')).toContain(values.name)
    expect(params.get('body')).toContain(values.email)
    expect(params.get('body')).toContain(values.subject)
    expect(params.get('body')).toContain(values.message)
  })

  it('n’encode jamais les espaces en "+" (invalide pour un mailto)', () => {
    const mailto = buildContactMailto(values)
    const [, query] = mailto.split('?')
    expect(query).not.toContain('+')
  })
})
