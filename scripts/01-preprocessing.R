needs(jsonlite)
needs(httr)
needs(magrittr)
needs(tidyr)
cat(getwd())
needs(dplyr)


winners <- read_json("input/ooe_kiga_ak_data.json")

list <- unlist(winners, recursive = FALSE)
df <- do.call("rbind", list)
dfts <- as.data.frame(df)
test <- setDT(dfts, keep.rownames = TRUE)[]
test <- dfts %>%
  mutate(rn = gsub("data.gkz_", "", rn)) %>%
  subset(rn!="year")

test <- gsub("data.gkz_", "", dfts)

needs(xlsx)
write.xlsx2(test, "test.xlsx")
