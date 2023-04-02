import React from 'react'
import { Typography, Card, Container, CardContent, Divider, Box, Grid, Paper } from "@mui/material"
import MuiMarkdown from 'mui-markdown'

function About() {
    return (
        <Container maxWidth="md">
            <Card style={{ marginTop: "20px" }}>
                <CardContent>
                    <Box m={4}>
                        <Typography gutterBottom variant="h5" component="div" >What is this?</Typography>
                        <Typography variant="body1" color="text.secondary">
                            This website is collecting questions and answers to assist beginning meditators. Specifically, it is asking users to provide examples of common questions and answers related to meditation practice. The website will use the examples provided by users to train an LLM (large language model) that underlies the wholesome meditation AI bot. The AI bot will generate new questions and answers based on the patterns and relationships learned from the labeled examples.</Typography>
                        {/* <Divider variant="middle"/> */}
                        <Typography variant="body1" color="text.secondary">
                            The use of Meta's llama model as the foundation for the AI bot provides advanced language processing capabilities that enable analysis and understanding of the nuances of natural language. By collecting a diverse and high-quality dataset of common questions and answers related to meditation practice, the website can ensure that the resulting AI bot can provide helpful and accurate guidance to beginning meditators. This data collection process for meditation-related questions and answers ensures that the AI bot is specialized for this purpose, providing a unique and beneficial experience for its users.</Typography>
                        <Typography gutterBottom variant="h5" component="div">How can I help?</Typography>
                        <Typography variant="body1" color="text.secondary">
                            Users can contribute to the training of the meditation AI bot by providing examples of common questions, answers, and context related to meditation practice. This can be done through submitting data via the website's platform.
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            By providing labeled examples of questions, answers, and context, users can help improve the accuracy and effectiveness of the AI bot. The AI bot will use these examples to learn patterns and relationships in natural language, enabling it to generate new questions and answers that are relevant and useful for beginning meditators.
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Additionally, users can provide feedback on the AI bot's responses, allowing the model to continuously improve and refine its output. By participating in this process, users can play a vital role in the development of a reliable and helpful meditation AI bot that can assist individuals in developing and maintaining their meditation practice.
                        </Typography>

                    </Box>
                </CardContent>
            </Card>
        </Container>
    )
}

export default About