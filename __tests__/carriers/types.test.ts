import { describe, it, expect } from 'vitest'
import { getTrackingUrl, SUPPORTED_CARRIERS } from '@/lib/carriers/types'

describe('Carrier Types', () => {
  describe('SUPPORTED_CARRIERS', () => {
    it('should contain the three supported carriers', () => {
      expect(SUPPORTED_CARRIERS).toContain('colissimo')
      expect(SUPPORTED_CARRIERS).toContain('chronopost')
      expect(SUPPORTED_CARRIERS).toContain('mondial-relay')
      expect(SUPPORTED_CARRIERS).toHaveLength(3)
    })
  })

  describe('getTrackingUrl', () => {
    it('should return correct Colissimo tracking URL', () => {
      const url = getTrackingUrl('colissimo', '1234567890')
      expect(url).toBe('https://www.laposte.fr/outils/suivre-vos-envois?code=1234567890')
    })

    it('should return correct Chronopost tracking URL', () => {
      const url = getTrackingUrl('chronopost', 'XY123456')
      expect(url).toBe('https://www.chronopost.fr/tracking-no-cms/suivi-page?liession=XY123456')
    })

    it('should return correct Mondial Relay tracking URL', () => {
      const url = getTrackingUrl('mondial-relay', 'MR12345')
      expect(url).toBe('https://www.mondialrelay.fr/suivi-de-colis/?numeroExpedition=MR12345')
    })

    it('should handle mondialrelay without hyphen', () => {
      const url = getTrackingUrl('mondialrelay', 'MR12345')
      expect(url).toBe('https://www.mondialrelay.fr/suivi-de-colis/?numeroExpedition=MR12345')
    })

    it('should return correct UPS tracking URL', () => {
      const url = getTrackingUrl('ups', '1Z999AA10123456784')
      expect(url).toBe('https://www.ups.com/track?tracknum=1Z999AA10123456784')
    })

    it('should return correct DHL tracking URL', () => {
      const url = getTrackingUrl('dhl', 'JD014600006506542578')
      expect(url).toBe('https://www.dhl.com/fr-fr/home/tracking.html?tracking-id=JD014600006506542578')
    })

    it('should return Google search for unknown carriers', () => {
      const url = getTrackingUrl('unknown-carrier', 'TRACK123')
      expect(url).toContain('google.com/search')
      expect(url).toContain('TRACK123')
    })

    it('should handle carrier names with spaces', () => {
      const url = getTrackingUrl('Mondial Relay', 'MR12345')
      expect(url).toBe('https://www.mondialrelay.fr/suivi-de-colis/?numeroExpedition=MR12345')
    })

    it('should be case-insensitive', () => {
      const url = getTrackingUrl('COLISSIMO', '1234567890')
      expect(url).toBe('https://www.laposte.fr/outils/suivre-vos-envois?code=1234567890')
    })
  })
})
