import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchRelayPoints, generateLabel } from '@/lib/carriers/mondial-relay'

describe('Mondial Relay', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('searchRelayPoints', () => {
    it('should call Mondial Relay SOAP API with correct parameters', async () => {
      const mockXml = `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <WSI4_PointRelais_RechercheResponse xmlns="http://www.mondialrelay.fr/webservice/">
              <WSI4_PointRelais_RechercheResult>
                <STAT>0</STAT>
                <PointsRelais>
                  <PointRelais_Details>
                    <Num>012345</Num>
                    <LgAdr1>TABAC DU CENTRE</LgAdr1>
                    <LgAdr3>15 RUE DE LA GARE</LgAdr3>
                    <Ville>PARIS</Ville>
                    <CP>75001</CP>
                    <Pays>FR</Pays>
                    <Latitude>48,856614</Latitude>
                    <Longitude>2,352222</Longitude>
                    <Distance>250</Distance>
                  </PointRelais_Details>
                  <PointRelais_Details>
                    <Num>067890</Num>
                    <LgAdr1>RELAIS COLIS</LgAdr1>
                    <LgAdr3>22 BOULEVARD SAINT-GERMAIN</LgAdr3>
                    <Ville>PARIS</Ville>
                    <CP>75005</CP>
                    <Pays>FR</Pays>
                    <Latitude>48,850000</Latitude>
                    <Longitude>2,345000</Longitude>
                    <Distance>500</Distance>
                  </PointRelais_Details>
                </PointsRelais>
              </WSI4_PointRelais_RechercheResult>
            </WSI4_PointRelais_RechercheResponse>
          </soap:Body>
        </soap:Envelope>`

      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockXml)
      } as any)

      const result = await searchRelayPoints({
        enseigne: 'BDTEST',
        privateKey: 'TestKey',
        country: 'FR',
        zipCode: '75001'
      })

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.mondialrelay.com/Web_Services.asmx',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'SOAPAction': 'http://www.mondialrelay.fr/webservice/WSI4_PointRelais_Recherche'
          })
        })
      )

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('012345')
      expect(result[0].name).toBe('TABAC DU CENTRE')
      expect(result[0].address).toBe('15 RUE DE LA GARE')
      expect(result[0].city).toBe('PARIS')
      expect(result[0].zipCode).toBe('75001')
      expect(result[0].latitude).toBeCloseTo(48.856614, 4)
      expect(result[0].distance).toBe(250)

      expect(result[1].id).toBe('067890')
      expect(result[1].name).toBe('RELAIS COLIS')
    })

    it('should handle error codes from API', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(`<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <WSI4_PointRelais_RechercheResponse xmlns="http://www.mondialrelay.fr/webservice/">
              <WSI4_PointRelais_RechercheResult>
                <STAT>2</STAT>
              </WSI4_PointRelais_RechercheResult>
            </WSI4_PointRelais_RechercheResponse>
          </soap:Body>
        </soap:Envelope>`)
      } as any)

      await expect(searchRelayPoints({
        enseigne: 'BDTEST',
        privateKey: 'TestKey',
        country: 'FR',
        zipCode: '00000'
      })).rejects.toThrow('code 2')
    })

    it('should handle HTTP errors', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500
      } as any)

      await expect(searchRelayPoints({
        enseigne: 'BDTEST',
        privateKey: 'TestKey',
        country: 'FR',
        zipCode: '75001'
      })).rejects.toThrow('Mondial Relay API error 500')
    })

    it('should return empty array for no results', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(`<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <WSI4_PointRelais_RechercheResponse xmlns="http://www.mondialrelay.fr/webservice/">
              <WSI4_PointRelais_RechercheResult>
                <STAT>0</STAT>
                <PointsRelais></PointsRelais>
              </WSI4_PointRelais_RechercheResult>
            </WSI4_PointRelais_RechercheResponse>
          </soap:Body>
        </soap:Envelope>`)
      } as any)

      const result = await searchRelayPoints({
        enseigne: 'BDTEST',
        privateKey: 'TestKey',
        country: 'FR',
        zipCode: '99999'
      })

      expect(result).toHaveLength(0)
    })
  })

  describe('generateLabel', () => {
    it('should call label creation API and return tracking number', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(`<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <WSI2_CreationEtiquetteResponse xmlns="http://www.mondialrelay.fr/webservice/">
              <WSI2_CreationEtiquetteResult>
                <STAT>0</STAT>
                <ExpeditionNum>31236789</ExpeditionNum>
                <URL_Etiquette>/tools/genere_etiquette_retour.aspx?id=31236789</URL_Etiquette>
              </WSI2_CreationEtiquetteResult>
            </WSI2_CreationEtiquetteResponse>
          </soap:Body>
        </soap:Envelope>`)
      } as any)

      const result = await generateLabel({
        enseigne: 'BDTEST',
        privateKey: 'TestKey',
        sender: {
          name: 'Faith Shop',
          address: '1 rue du Commerce',
          city: 'Paris',
          zipCode: '75001',
          countryCode: 'FR'
        },
        recipient: {
          name: 'Jean Dupont',
          address: '10 avenue des Champs',
          city: 'Lyon',
          zipCode: '69001',
          countryCode: 'FR'
        },
        weight: 0.5,
        deliveryMode: 'relay',
        relayPointId: '012345'
      })

      expect(result.trackingNumber).toBe('31236789')
      expect(result.trackingUrl).toContain('31236789')
      expect(result.labelUrl).toContain('31236789')
    })

    it('should handle error from label creation', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(`<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <WSI2_CreationEtiquetteResponse xmlns="http://www.mondialrelay.fr/webservice/">
              <WSI2_CreationEtiquetteResult>
                <STAT>20</STAT>
              </WSI2_CreationEtiquetteResult>
            </WSI2_CreationEtiquetteResponse>
          </soap:Body>
        </soap:Envelope>`)
      } as any)

      await expect(generateLabel({
        enseigne: 'BDTEST',
        privateKey: 'Bad',
        sender: { name: 'X', address: 'X', city: 'X', zipCode: '00000', countryCode: 'FR' },
        recipient: { name: 'X', address: 'X', city: 'X', zipCode: '00000', countryCode: 'FR' },
        weight: 1,
        deliveryMode: 'home'
      })).rejects.toThrow('code 20')
    })
  })
})
