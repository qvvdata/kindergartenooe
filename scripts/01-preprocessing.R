numerize <- function(data,vars){
  data = as.data.frame(data)
  variables <- colnames(data)
  variables <- variables[! variables %in% vars]
  for(i in variables){
    data[,i]<- as.numeric(data[,i])
    data[,i][is.na(data[,i])] <- 0
  }
  return(data)
}
source("scripts/BorderManOhneSumme.R")

#alle gemeinden
gemeinden <- read_excel("input/gemeindeliste.xls", sheet="gemliste_knz") %>%
  drop_na(gkz)

#alle gemeinden nach urbanisierung
urbanrural <- read_excel("input/urbanruralgemeinden.xlsx", sheet="GEMEINDELISTE") %>%
  drop_na(GKZ)

gemeinden <- gemeinden %>% left_join(select(urbanrural, GKZ, UR_TYP), by = c ("gkz"="GKZ"))

#Erwerbsstatus reinladen 2015
erwerb <- read_excel("input/erwers.xlsx") %>%
  numerize(c("gemeinde"))%>%
  select(-gemeinde)


# Kindertagesheimstatistik, Einrichtungen und Kinder 2016/17 nach der Anzahl der geöffneten Stunden pro Betriebstag laden
offenestd16 <- read_excel("input/QVV KTH-Detaildaten 2016 nach GEMNR.xlsx", sheet="offene Stunden") 
geschlossen16 <- read_excel("input/QVV KTH-Detaildaten 2016 nach GEMNR.xlsx", sheet="Schließtage") 

#
offenestd06 <- read_excel("input/QVV KTH-Detaildaten 2006 nach GEMNR.xlsx", sheet="offene Stunden") 
geschlossen06 <- read_excel("input/QVV KTH-Detaildaten 2006 nach GEMNR.xlsx", sheet="Schließtage") 


colnames(offenestd16) <- gsub("-", "", colnames(offenestd16))
colnames(offenestd16) <- gsub("\\r", "", colnames(offenestd16))  
colnames(offenestd16) <- gsub("\\n", "", colnames(offenestd16))  
colnames(offenestd16) <- gsub(" ", "", colnames(offenestd16))
colnames(offenestd16) <- gsub("\\.", "", colnames(offenestd16))
colnames(offenestd16)[which(names(offenestd16) == "GEMNR")] <- "gkz"
colnames(offenestd16)[which(names(offenestd16) == "GEMNR")] <- "gkz"
offenestd16 <- select(offenestd16, -geführteFormBezeichn, -ErhalterBezeichn)
offenestd16[is.na(offenestd16)] <- 0


offenestd16 <- remove_teilungen(borderman(offenestd16))

colnames(offenestd06) <- gsub("-", "", colnames(offenestd06))
colnames(offenestd06) <- gsub("\\r", "", colnames(offenestd06))  
colnames(offenestd06) <- gsub("\\n", "", colnames(offenestd06))  
colnames(offenestd06) <- gsub(" ", "", colnames(offenestd06))
colnames(offenestd06) <- gsub("\\.", "", colnames(offenestd06))
colnames(offenestd06)[which(names(offenestd06) == "GEMNR")] <- "gkz"
offenestd06 <- select(offenestd06, -geführteFormBezeichn, -ErhalterBezeichn, -Gemeindebezeichnung)
offenestd06[is.na(offenestd06)] <- 0
offenestd06 <- remove_teilungen(borderman(offenestd06))

colnames(geschlossen06) <- gsub("-", "", colnames(geschlossen06))
colnames(geschlossen06) <- gsub("\\r", "", colnames(geschlossen06))  
colnames(geschlossen06) <- gsub("\\n", "", colnames(geschlossen06))  
colnames(geschlossen06) <- gsub(" ", "", colnames(geschlossen06))
colnames(geschlossen06) <- gsub("\\.", "", colnames(geschlossen06))
colnames(geschlossen06)[which(names(geschlossen06) == "GEMNR")] <- "gkz"
geschlossen06 <- select(geschlossen06, -geführteFormBezeichn, -ErhalterBezeichn)
geschlossen06[is.na(geschlossen06)] <- 0
geschlossen06 <- remove_teilungen(borderman(geschlossen06))

colnames(geschlossen16) <- gsub("-", "", colnames(geschlossen16))
colnames(geschlossen16) <- gsub("\\r", "", colnames(geschlossen16))  
colnames(geschlossen16) <- gsub("\\n", "", colnames(geschlossen16))  
colnames(geschlossen16) <- gsub(" ", "", colnames(geschlossen16))
colnames(geschlossen16) <- gsub("\\.", "", colnames(geschlossen16))
colnames(geschlossen16)[which(names(geschlossen16) == "GEMNR")] <- "gkz"
geschlossen16 <- select(geschlossen16, -geführteFormBezeichn, -ErhalterBezeichn)
geschlossen16[is.na(geschlossen16)] <- 0
geschlossen16 <- remove_teilungen(borderman(geschlossen16))



# Doku für geführte Form
# 1 Krippe, Kleinkindbetreuungseinrichtung
# 2 Kindergarten
# 3 Schülerhorte
# 4 Altersgemischte Betreuungseinrichtung

#Doku für Erhalter
# 1 öffentlich
# 2 privat

#Zählen der jeweiligen Betreuungseinrichtungen pro Gemeinde
countstd16 <- offenestd16 %>%
  filter(geführteFormNr == "2" | geführteFormNr == "4") %>%
  group_by(gkz_neu, AnzahlderEinrichtungen) %>%
  summarise(countstd16=n())%>%
  mutate(Einrsumcountstd16 = AnzahlderEinrichtungen*countstd16)%>%
  group_by(gkz_neu)%>%
  summarise(Einrsumcountstd16 = sum(Einrsumcountstd16)) %>%
  select(c(gkz_neu, Einrsumcountstd16))


countstd06 <- offenestd06 %>%
  filter(geführteFormNr == "2" | geführteFormNr == "4") %>%
  group_by(gkz_neu, AnzahlderEinrichtungen) %>%
  summarise(countstd06=n())%>%
  mutate(Einrsumcountstd06 = AnzahlderEinrichtungen*countstd06)%>%
  group_by(gkz_neu)%>%
  summarise(Einrsumcountstd06 = sum(Einrsumcountstd06)) %>%
  select(c(gkz_neu, Einrsumcountstd06))


# Zu gemeinden-DF hinzufügen
gemeinden <- gemeinden %>%
  left_join(countstd16, by = c("gkz"="gkz_neu")) %>%
  left_join(countstd06, by = c("gkz"="gkz_neu")) 
gemeinden$Einrsumcountstd16[is.na(gemeinden$Einrsumcountstd16)] <- 0
gemeinden$Einrsumcountstd06[is.na(gemeinden$Einrsumcountstd06)] <- 0
gemeinden <- gemeinden %>%
             mutate(einrichtungsdiff = Einrsumcountstd16-Einrsumcountstd06)%>%
             select(-c(status, plz, weiterePlz))

#Gewichtung der Öffnungsstunden


gemstd16_max <- offenestd16 %>%
  filter(geführteFormNr == "2" | geführteFormNr == "4") %>%
  mutate(AnzahlderbetreutenKinder_3_6 = Alter3+Alter4+Alter5,
         gewichteteminuten = durchschngeöffenteMinutenproBetriebstag) %>%
  group_by(gkz_neu) %>%
  summarize(gewichteteminuten = max(gewichteteminuten)) %>%
  filter(gkz_neu!="0")

gemstd16 <- offenestd16 %>%
          filter(geführteFormNr == "2" | geführteFormNr == "4") %>%
          mutate(AnzahlderbetreutenKinder_3_6 = Alter3+Alter4+Alter5,
                   gewichteteminuten = durchschngeöffenteMinutenproBetriebstag*AnzahlderbetreutenKinder_3_6) %>%
          group_by(gkz_neu) %>%
          summarize(summegewkind = sum(AnzahlderbetreutenKinder_3_6), 
                    gewichteteminuten =sum(gewichteteminuten)
                 ) %>%
          mutate(gemgew = gewichteteminuten/summegewkind) %>%
  filter(gkz_neu!="0")

gemstd06 <- offenestd06 %>%
  filter(geführteFormNr == "2" | geführteFormNr == "4") %>%
  mutate(AnzahlderbetreutenKinder_3_6 = Alter3+Alter4+Alter5,
         gewichteteminuten = durchschngeöffenteMinutenproBetriebstag*AnzahlderbetreutenKinder_3_6) %>%
  group_by(gkz_neu) %>%
  summarize(summegewkind = sum(AnzahlderbetreutenKinder_3_6), 
            gewichteteminuten =sum(gewichteteminuten)) %>%
  mutate(gemgew = gewichteteminuten/summegewkind)%>%
  filter(gkz_neu!="0")

#Gewichtung der geschlossenen Tage 2006
gemzu06 <- geschlossen06 %>%
  filter(geführteFormNr == "2" | geführteFormNr == "4") %>%
  mutate(AnzahlderbetreutenKinder_3_6 = Alter3+Alter4+Alter5,
         gewichtetetage = SchließtageproJahr*AnzahlderbetreutenKinder_3_6) %>%
  group_by(gkz_neu) %>%
  summarize(summegewkind = sum(AnzahlderbetreutenKinder_3_6), 
            gewichtetetage =sum(gewichtetetage)
  ) %>%
  mutate(gemgewtag = gewichtetetage/summegewkind)%>%
  filter(gkz_neu!="0")

#Gewichtung der geschlossenen Tage 2016
gemzu16 <- geschlossen16 %>%
  filter(geführteFormNr == "2" | geführteFormNr == "4") %>%
  mutate(AnzahlderbetreutenKinder_3_6 = Alter3+Alter4+Alter5,
         gewichtetetage = SchließtageproJahr*AnzahlderbetreutenKinder_3_6) %>%
  group_by(gkz_neu) %>%
  summarize(summegewkind = sum(AnzahlderbetreutenKinder_3_6), 
            gewichtetetage =sum(gewichtetetage)
  ) %>%
  mutate(gemgewtag = gewichtetetage/summegewkind)%>%
  filter(gkz_neu!="0")


# Mit richtigem Bordermann auf die aktuellen GKZ setzen und auch fusionieren
#source("scripts/BorderMan.R")



#Joinen aller Zu und Std

std <- gemeinden %>%
  left_join(gemstd16, by = c("gkz"="gkz_neu")) %>%
  rename(gemgew16 = gemgew, summegewkind16 = summegewkind) %>%
  select(-c(gewichteteminuten)) %>%
  left_join(gemstd06, by = c("gkz"="gkz_neu")) %>%
  rename(gemgew06 = gemgew, summegewkind06 = summegewkind) %>%
  replace_na(list(gemgew06=0, gemgew16=0))%>%
  mutate(diff = gemgew16-gemgew06)%>%
  select(-gewichteteminuten)%>%
  left_join(gemzu06, by = c("gkz"="gkz_neu")) %>%
  select(-c(summegewkind, gewichtetetage))%>%
  rename(gemgewtag06=gemgewtag) %>%
  left_join(gemzu16, by = c("gkz"="gkz_neu")) %>%
  rename(gemgewtag16 = gemgewtag, diffmin=diff)%>%
  select(-gewichtetetage)%>%
  mutate(difftage = gemgewtag16-gemgewtag06,
         gkz = as.numeric(gkz), 
         typgmd = substr(UR_TYP, 1,1))%>%
  drop_na(gkz)


std$typgmdtxt[std$typgmd == 1] <- "städtisch"
std$typgmdtxt[std$typgmd > 1]  <- "ländlich"

std$diffmintxt[std$diffmin == 0] <- "gleich"
std$diffmintxt[std$diffmin > 0]  <- "länger"
std$diffmintxt[std$diffmin < 0] <- "kürzer"

# Testing
# ggplot(std, aes(x = diffmin)) +
#   geom_dotplot(binwidth = 1, color) +
#   #scale_y_continuous(NULL, breaks = NULL)+
#   theme_minimal() +
#   scale_x_continuous(limits = c(-240,330.00), 
#                      breaks = c(-60,0,60))
#scale_y_continuous(limits = c(0,500))

#Erwerbsdaten dazumergen
source("scripts/BorderMan.R")
erwerb <- remove_teilungen(borderman(erwerb))

erwerbsdaten <- erwerb%>%
  mutate(vzquote = `2015_frauen_erwerbstätig_vz`/(`2015_frauen_erwerbstätig_vz`+`2015_frauen_erwerbstätig_tz`*100)
         )


# Alle überflüssigen DFs entfernen
rm(list= ls()[!(ls() %in% c('gemeinden','std','numerize','remove_teilungen','borderman','bundeslaendergrenzen','gemstd16_max'))])
