import cute from "@assets/img/memes/cute.gif";
import { Box, Image, Switch, Text, useColorModeValue, VStack, Link, Flex, Center, Input } from "@chakra-ui/react";
import { useState } from "react";
import { getSearchOptions } from "./search";

const Popup = () => {
  const [value, setValue] = useState('')
  const [searchOptions, setSearchOptions] = useState([])
  const handleChange = (event) => {
    setValue(event.target.value)
    getSearchOptions(event.target.value).then(setSearchOptions)
  }
  return (
    <Flex width={"100vw"} height={"100vh"} alignContent={"center"} justifyContent={"center"}>
    <Box w="md" py="4" px="8" userSelect="none" marginTop="8%">
      <VStack>
        <Link href="https://defillama.com/" isExternal>
          <Image src={cute} alt="Cute Llama" w="14" />
        </Link>
        <Text fontSize="xl" fontWeight="bold">
          LlamaSearch
        </Text>
      </VStack>
      <VStack>
        <Input
          placeholder='Search' 
          size='lg' 
          value={value}
          onChange={handleChange}
        />
      </VStack>
      <VStack>
        {searchOptions.map(o=><Link href={o.url}>{o.text}</Link>)}
      </VStack>
    </Box>
    </Flex>
  );
};

export default Popup;
